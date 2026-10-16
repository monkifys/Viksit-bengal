/**
 * Tier 1: Feature Coverage - Authentication & JWT
 * >= 5 test cases covering happy path, roles, token generation and profile retrieval
 */

import { assertEqual, assertProperties, assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. Admin login
  try {
    const res = await ctx.login(USERS.admin.email, USERS.admin.password);
    assertStatusCode(res, 200, 'Admin login should succeed');
    assertProperties(res.data, ['accessToken', 'user'], 'Response must have accessToken and user');
    assertEqual(res.data.user.role, 'ADMIN', 'Admin role must match');
    results.push({ name: 'Admin login returns 200 and JWT with ADMIN role', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Admin login returns 200 and JWT with ADMIN role', status: 'FAIL', error: err.message });
  }

  // 2. Researcher login
  try {
    const res = await ctx.login(USERS.researcher.email, USERS.researcher.password);
    assertStatusCode(res, 200, 'Researcher login should succeed');
    assertEqual(res.data.user.role, 'RESEARCHER', 'Researcher role must match');
    results.push({ name: 'Researcher login returns 200 and JWT with RESEARCHER role', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Researcher login returns 200 and JWT with RESEARCHER role', status: 'FAIL', error: err.message });
  }

  // 3. Public login
  try {
    const res = await ctx.login(USERS.public.email, USERS.public.password);
    assertStatusCode(res, 200, 'Public user login should succeed');
    assertEqual(res.data.user.role, 'PUBLIC', 'Public role must match');
    results.push({ name: 'Public user login returns 200 with PUBLIC role', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Public user login returns 200 with PUBLIC role', status: 'FAIL', error: err.message });
  }

  // 4. GET /auth/me with valid token
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const meRes = await ctx.getMe();
    assertStatusCode(meRes, 200, 'GET /auth/me should succeed with valid token');
    assertEqual(meRes.data.email, USERS.admin.email, 'Email should match authenticated admin');
    assertEqual(meRes.data.role, 'ADMIN', 'Role should match authenticated admin');
    results.push({ name: 'GET /auth/me returns authenticated user profile', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /auth/me returns authenticated user profile', status: 'FAIL', error: err.message });
  }

  // 5. GET /auth/me without token
  try {
    ctx.setToken(null);
    const unauthRes = await ctx.getMe();
    assertStatusCode(unauthRes, 401, 'GET /auth/me without token should return 401');
    results.push({ name: 'GET /auth/me without token returns 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /auth/me without token returns 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  // 6. Invalid credentials
  try {
    const badRes = await ctx.login('nonexistent@viksitbengal.gov.in', 'WrongPass999');
    assertStatusCode(badRes, 401, 'Bad credentials should return 401');
    results.push({ name: 'POST /auth/login with invalid password returns 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /auth/login with invalid password returns 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  return results;
}
