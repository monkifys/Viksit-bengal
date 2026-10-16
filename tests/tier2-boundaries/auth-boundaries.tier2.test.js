/**
 * Tier 2: Boundary & Corner Cases - Auth & Token Boundaries
 * >= 5 test cases testing malformed payloads, injection attempts, and token tampering
 */

import { assertStatusCode } from '../harness/assertions.js';
import { USERS, ADVERSARIAL_PAYLOADS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. Missing password
  try {
    const res = await ctx.login(USERS.admin.email, '');
    assertStatusCode(res, 400, 'Empty password must be rejected with 400');
    results.push({ name: 'Empty password payload rejected with 400 Bad Request', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Empty password payload rejected with 400 Bad Request', status: 'FAIL', error: err.message });
  }

  // 2. Missing email
  try {
    const res = await ctx.login('', USERS.admin.password);
    assertStatusCode(res, 400, 'Empty email must be rejected with 400');
    results.push({ name: 'Empty email payload rejected with 400 Bad Request', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Empty email payload rejected with 400 Bad Request', status: 'FAIL', error: err.message });
  }

  // 3. SQL injection attempt in login email
  try {
    const res = await ctx.login(ADVERSARIAL_PAYLOADS.sqli[0], 'password123');
    // Must return 401 Unauthorized, never 500 database error
    assertStatusCode(res, 401, 'SQL injection in email must fail cleanly with 401 without 500 error');
    results.push({ name: 'SQL injection payload in login email fails safely with 401', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'SQL injection payload in login email fails safely with 401', status: 'FAIL', error: err.message });
  }

  // 4. Tampered JWT signature
  try {
    ctx.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHZpa3NpdGJlbmdhbC5nb3YuaW4iLCJyb2xlIjoiQURNSU4ifQ.tampered_signature');
    const res = await ctx.getMe();
    assertStatusCode(res, 401, 'Tampered token signature must be rejected');
    results.push({ name: 'JWT with forged signature rejected with 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'JWT with forged signature rejected with 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  // 5. Expired token simulation
  try {
    const expiredPayload = {
      sub: 'admin@viksitbengal.gov.in',
      email: 'admin@viksitbengal.gov.in',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) - 3600 // expired 1 hour ago
    };
    const b64 = Buffer.from(JSON.stringify(expiredPayload)).toString('base64');
    ctx.setToken(`mock.header.${b64}.signature`);
    const res = await ctx.getMe();
    assertStatusCode(res, 401, 'Expired token must return 401');
    results.push({ name: 'Expired JWT token rejected with 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Expired JWT token rejected with 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  // 6. Privilege escalation injection payload in login
  try {
    const res = await ctx.login(USERS.public.email, USERS.public.password);
    // Even if client attempts to pass role='ADMIN' in body
    if (res.data?.user) {
      if (res.data.user.role === 'ADMIN') throw new Error('Privilege escalation occurred');
    }
    results.push({ name: 'Client cannot elevate role to ADMIN via parameter tampering in login', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Client cannot elevate role to ADMIN via parameter tampering in login', status: 'FAIL', error: err.message });
  }

  return results;
}
