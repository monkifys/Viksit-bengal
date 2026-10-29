const assert = require('node:assert');

class SlidingWindowRateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 5;
    this.windowMs = options.windowMs || 15 * 60 * 1000;
    this.hits = new Map();
  }

  getClientIp(req) {
    if (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1') {
      const forwarded = req.headers && req.headers['x-forwarded-for'];
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
    }
    return (req.socket && req.socket.remoteAddress) || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
  }

  check(ip, now = Date.now()) {
    const windowStart = now - this.windowMs;
    let timestamps = this.hits.get(ip) || [];
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const oldestInWindow = timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + this.windowMs - now) / 1000);
      return {
        allowed: false,
        retryAfter: Math.max(retryAfterSeconds, 1),
        currentCount: timestamps.length
      };
    }

    timestamps.push(now);
    this.hits.set(ip, timestamps);
    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      currentCount: timestamps.length
    };
  }

  cleanup(now = Date.now()) {
    const windowStart = now - this.windowMs;
    for (const [ip, timestamps] of this.hits.entries()) {
      const active = timestamps.filter(t => t > windowStart);
      if (active.length === 0) {
        this.hits.delete(ip);
      } else {
        this.hits.set(ip, active);
      }
    }
  }

  reset() {
    this.hits.clear();
  }
}

// Test 1: 5 requests allowed, 6th blocked
const limiter = new SlidingWindowRateLimiter({ maxRequests: 5, windowMs: 1000 });
const ip1 = '192.168.1.10';
for (let i = 0; i < 5; i++) {
  const res = limiter.check(ip1, 1000 + i * 10);
  assert.strictEqual(res.allowed, true, `Request ${i + 1} should be allowed`);
}
const blocked = limiter.check(ip1, 1050);
assert.strictEqual(blocked.allowed, false, '6th request should be blocked');
assert.ok(blocked.retryAfter > 0, 'Retry-after should be positive');

// Test 2: Separate IP allowed
const ip2 = '192.168.1.20';
const resIp2 = limiter.check(ip2, 1050);
assert.strictEqual(resIp2.allowed, true, 'Different IP should have separate limit');

// Test 3: Allowed after window expires
const resAfterWindow = limiter.check(ip1, 2050);
assert.strictEqual(resAfterWindow.allowed, true, 'Request after window expiry should be allowed');

// Test 4: Cleanup
limiter.cleanup(3500);
assert.strictEqual(limiter.hits.size, 0, 'Expired entries should be cleaned up');

// Test 5: Client IP detection (untrusted header ignored)
delete process.env.TRUST_PROXY;
const reqUntrusted = { headers: { 'x-forwarded-for': '1.2.3.4' }, socket: { remoteAddress: '10.0.0.1' } };
assert.strictEqual(limiter.getClientIp(reqUntrusted), '10.0.0.1', 'Untrusted proxy header must be ignored');

process.env.TRUST_PROXY = 'true';
assert.strictEqual(limiter.getClientIp(reqUntrusted), '1.2.3.4', 'Trusted proxy header should be accepted');

console.log('All rate limiter unit tests passed successfully!');
