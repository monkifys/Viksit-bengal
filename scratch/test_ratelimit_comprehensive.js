const test = require('node:test');
const assert = require('node:assert/strict');
const { SlidingWindowRateLimiter } = require('../server.js');

test('Rate Limiter - In-Memory Sliding-Window Mechanics & Anti-Bypass', () => {
  const limiter = new SlidingWindowRateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000 // 15 mins
  });

  const ip1 = '192.168.1.100';
  const ip2 = '10.0.0.50';
  const baseTime = 1000000;

  // 1. Five valid submissions from the same IP within 15 mins are allowed
  for (let i = 1; i <= 5; i++) {
    const res = limiter.check(ip1, baseTime + i * 1000);
    assert.equal(res.allowed, true, `Submission ${i} from ip1 must be allowed`);
    assert.equal(res.remaining, 5 - i);
    assert.equal(res.currentCount, i);
  }

  // 2. The sixth submission is rejected with allowed: false and accurate retryAfter
  const sixthRes = limiter.check(ip1, baseTime + 6 * 1000);
  assert.equal(sixthRes.allowed, false, 'Sixth request from ip1 must be blocked');
  assert.ok(sixthRes.retryAfter > 0, 'Must provide positive retryAfter seconds');
  assert.ok(sixthRes.retryAfter <= 15 * 60, 'retryAfter must be within window bounds');

  // 3. Different IPs have independent limits
  const ip2Res = limiter.check(ip2, baseTime + 7 * 1000);
  assert.equal(ip2Res.allowed, true, 'ip2 must be allowed independently of ip1 quota');
  assert.equal(ip2Res.remaining, 4);

  // 4. Forwarded-IP headers cannot bypass limit when not trusted (TRUST_PROXY unset/false)
  delete process.env.TRUST_PROXY;
  const mockReqUntrusted = {
    headers: { 'x-forwarded-for': '203.0.113.195, 70.41.3.18' },
    socket: { remoteAddress: '127.0.0.1' }
  };
  const extractedIpUntrusted = limiter.getClientIp(mockReqUntrusted);
  assert.equal(extractedIpUntrusted, '127.0.0.1', 'Arbitrary X-Forwarded-For must be ignored when TRUST_PROXY is false');

  // 5. Forwarded-IP headers trusted when TRUST_PROXY=true
  process.env.TRUST_PROXY = 'true';
  const extractedIpTrusted = limiter.getClientIp(mockReqUntrusted);
  assert.equal(extractedIpTrusted, '203.0.113.195', 'First proxy IP trusted when TRUST_PROXY=true');
  delete process.env.TRUST_PROXY; // clean up

  // 6. Request allowed after the appropriate window expires
  const afterExpiryTime = baseTime + (15 * 60 * 1000) + 10000; // 15 mins + 10 sec later
  const postExpiryRes = limiter.check(ip1, afterExpiryTime);
  assert.equal(postExpiryRes.allowed, true, 'Request after rolling window expiry must be allowed');

  // 7. Rate-limit entries are cleaned up appropriately
  limiter.cleanup(afterExpiryTime);
  // Entries older than windowStart must be purged
  assert.equal(limiter.hits.has(ip2), false, 'Expired IP entries must be purged by cleanup');
  assert.equal(limiter.hits.has(ip1), true, 'Active IP entries must remain in cache');

  console.log('✅ Rate Limiter - Mechanics & Anti-Bypass PASSED');
});
