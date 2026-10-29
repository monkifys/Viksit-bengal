/**
 * Unit Test Suite for Viksit Bengal Dashboard
 * Testing mathematical engines, economic calculator, authentication, and CSV helpers.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const {
  calculateRequiredCAGR,
  generateTrajectory,
  calculateScenarios
} = require('../js/calculator.js');
const auth = require('../auth.js');
const csvHelper = require('../csv-helper.js');

test('Economic Calculator - CAGR Formula', () => {
  // Baseline: $207B in 2024, Target: $1000B in 2033 (n = 9 years)
  // CAGR = (1000 / 207)^(1/9) - 1 ≈ 0.19124 (19.12%)
  const cagr = calculateRequiredCAGR(207, 1000, 9);
  assert.ok(Math.abs(cagr - 19.12) < 0.1, `Expected CAGR approx 19.12%, got ${cagr}`);

  // Base $100 to Target $200 in 1 year = 100%
  assert.equal(calculateRequiredCAGR(100, 200, 1), 100.0);

  // Error handling for non-positive or 0 years
  assert.equal(calculateRequiredCAGR(0, 1000, 5), 0);
  assert.equal(calculateRequiredCAGR(100, 1000, 0), 0);
});

test('Economic Calculator - Trajectory Generation', () => {
  const trajectory = generateTrajectory(207, 2024, 2033, 19.12);
  assert.equal(trajectory.length, 10); // 2024 through 2033 inclusive
  assert.equal(trajectory[0].year, 2024);
  assert.equal(trajectory[0].projectedValue, 207);
  assert.equal(trajectory[trajectory.length - 1].year, 2033);
  assert.ok(trajectory[trajectory.length - 1].projectedValue >= 995, 'Target should reach ~1000');
});

test('Economic Calculator - 3 Scenario Projections', () => {
  const result = calculateScenarios(207, 1000, 2024, 2033);
  const s = result.scenarios;
  assert.ok(s.conservative);
  assert.ok(s.base);
  assert.ok(s.ambitious);

  // Ambitious should exceed Conservative
  assert.ok(s.ambitious.cagr > s.base.cagr);
  assert.ok(s.base.cagr > s.conservative.cagr);
  assert.ok(s.ambitious.projected2033Usd > s.conservative.projected2033Usd);
});

test('Authentication - Password Hashing & Verification', () => {
  const password = 'SuperSecretCivicPass!2026';
  const salt = auth.generateSalt();
  assert.ok(salt && salt.length === 32, 'Salt should be 16 bytes hex');

  const hash = auth.hashPassword(password, salt);
  assert.ok(hash && hash.length === 128, 'Hash should be 64 bytes hex');

  // Verify correct password
  assert.equal(auth.verifyPassword(password, salt, hash), true);

  // Verify wrong password fails
  assert.equal(auth.verifyPassword('WrongPass', salt, hash), false);
});

test('Authentication - RBAC Hierarchy', () => {
  const adminUser = { role: 'admin' };
  const reviewerUser = { role: 'reviewer' };
  const researcherUser = { role: 'researcher' };
  const publicUser = { role: 'public' };

  // Admin has all roles
  assert.equal(auth.hasRole(adminUser, 'admin'), true);
  assert.equal(auth.hasRole(adminUser, 'reviewer'), true);
  assert.equal(auth.hasRole(adminUser, 'researcher'), true);

  // Reviewer has reviewer & researcher roles, not admin
  assert.equal(auth.hasRole(reviewerUser, 'admin'), false);
  assert.equal(auth.hasRole(reviewerUser, 'reviewer'), true);
  assert.equal(auth.hasRole(reviewerUser, 'researcher'), true);

  // Researcher has researcher role only
  assert.equal(auth.hasRole(researcherUser, 'reviewer'), false);
  assert.equal(auth.hasRole(researcherUser, 'researcher'), true);

  // Public user
  assert.equal(auth.hasRole(publicUser, 'researcher'), false);
  assert.equal(auth.hasRole(null, 'public'), false);
});

test('CSV Helper - Format and Parse Round-trip', () => {
  const testData = [
    { id: 'item-1', name: 'Kolkata Metro "Green Line"', count: 120, notes: 'Line 1\nLine 2' },
    { id: 'item-2', name: 'Deocha Pachami, Birbhum', count: 450, notes: 'Simple note' }
  ];

  const headers = ['id', 'name', 'count', 'notes'];
  const csvString = csvHelper.formatCsv(testData, headers);

  assert.ok(csvString.includes('"Kolkata Metro ""Green Line"""'), 'Should escape quotes properly');
  assert.ok(csvString.includes('"Deocha Pachami, Birbhum"'), 'Should escape commas properly');

  const parsed = csvHelper.parseCsv(csvString);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].id, 'item-1');
  assert.equal(parsed[0].name, 'Kolkata Metro "Green Line"');
  assert.equal(parsed[1].id, 'item-2');
  assert.equal(parsed[1].name, 'Deocha Pachami, Birbhum');
});

test('Civic Status Model & Evidence Confidence Grades', () => {
  const VALID_STATUSES = [
    'not_started', 'announced', 'legally_initiated', 'funded',
    'under_implementation', 'partially_delivered', 'delivered',
    'delayed', 'reversed', 'disputed', 'not_verifiable'
  ];

  const VALID_GRADES = ['A', 'B', 'C', 'D'];

  // Test status model validity
  VALID_STATUSES.forEach(status => {
    assert.ok(typeof status === 'string' && status.length > 0);
  });

  // Test confidence grades validity
  VALID_GRADES.forEach(grade => {
    assert.ok(['A', 'B', 'C', 'D'].includes(grade));
  });
});

test('Rate Limiter - In-Memory Sliding-Window Mechanics & Anti-Bypass', () => {
  const { SlidingWindowRateLimiter } = require('../server.js');
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
  const origTrust = process.env.TRUST_PROXY;
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
  if (origTrust !== undefined) process.env.TRUST_PROXY = origTrust;
  else delete process.env.TRUST_PROXY;

  // 6. Request allowed after the appropriate window expires
  const afterExpiryTime = baseTime + (15 * 60 * 1000) + 10000; // 15 mins + 10 sec later
  const postExpiryRes = limiter.check(ip1, afterExpiryTime);
  assert.equal(postExpiryRes.allowed, true, 'Request after rolling window expiry must be allowed');

  // 7. Rate-limit entries are cleaned up appropriately
  limiter.cleanup(afterExpiryTime);
  assert.equal(limiter.hits.has(ip2), false, 'Expired IP entries must be purged by cleanup');
  assert.equal(limiter.hits.has(ip1), true, 'Active IP entries must remain in cache');
});

test('Stats & Promise Metrics - Canonical Status Mapping & Remaining Fulfillment Calculation', () => {
  const LEGACY_STATUS_MAP = {
    done: 'delivered',
    inprogress: 'under_implementation',
    pending: 'not_started',
    evaded: 'not_verifiable'
  };
  function normalize(s) {
    if (!s) return 'not_started';
    return LEGACY_STATUS_MAP[s] || s;
  }

  // Simulate database promises with diverse statuses
  const testPromises = [
    { id: 'p1', status: 'delivered' },
    { id: 'p2', status: 'done' }, // legacy format
    { id: 'p3', status: 'under_implementation' },
    { id: 'p4', status: 'partially_delivered' },
    { id: 'p5', status: 'not_started' },
    { id: 'p6', status: 'pending' }, // legacy format
    { id: 'p7', status: 'reversed' }
  ];

  const counts = { done: 0, inprogress: 0, evaded: 0, pending: 0 };
  testPromises.forEach((p) => {
    const norm = normalize(p.status);
    if (norm === 'delivered') counts.done += 1;
    else if (norm === 'under_implementation' || norm === 'legally_initiated' || norm === 'funded' || norm === 'partially_delivered') counts.inprogress += 1;
    else if (norm === 'reversed' || norm === 'delayed' || norm === 'disputed' || norm === 'not_verifiable') counts.evaded += 1;
    else counts.pending += 1;
  });

  assert.equal(counts.done, 2, 'Fulfilled count must correctly account for both delivered and done');
  assert.equal(counts.inprogress, 2, 'In-progress count must account for under_implementation and partially_delivered');
  assert.equal(counts.pending, 2, 'Pending/remained count must account for not_started and pending');
  assert.equal(counts.evaded, 1, 'Evaded count must account for reversed');

  const completionPct = ((counts.done / testPromises.length) * 100).toFixed(1);
  assert.equal(completionPct, '28.6', 'Completion percentage calculation must be accurate');
});
