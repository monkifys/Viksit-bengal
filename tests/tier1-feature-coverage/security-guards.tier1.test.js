/**
 * Tier 1: Feature Coverage - Security Guards (AuthGuard & RolesGuard - 007)
 * >= 5 test cases verifying strict RBAC enforcement and token verification
 */

import { assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. AuthGuard rejects unauthenticated mutation
  try {
    ctx.setToken(null);
    const res = await ctx.createPromise({ code: 'P1', titleEn: 'T', titleBn: 'টি' });
    assertStatusCode(res, 401, 'Must reject unauthenticated request');
    results.push({ name: 'AuthGuard rejects request with missing Bearer token (401)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'AuthGuard rejects request with missing Bearer token (401)', status: 'FAIL', error: err.message });
  }

  // 2. AuthGuard rejects malformed token
  try {
    ctx.setToken('malformed.token.garbage');
    const res = await ctx.getMe();
    assertStatusCode(res, 401, 'Must reject malformed token');
    results.push({ name: 'AuthGuard rejects malformed JWT signature (401)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'AuthGuard rejects malformed JWT signature (401)', status: 'FAIL', error: err.message });
  }

  // 3. RolesGuard permits ADMIN to create promises
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const res = await ctx.createPromise({ code: 'ADM-01', titleEn: 'Admin Prom', titleBn: 'প্রমিস' });
    assertStatusCode(res, 201, 'Admin role should be permitted');
    results.push({ name: 'RolesGuard permits ADMIN role for promise creation (201)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'RolesGuard permits ADMIN role for promise creation (201)', status: 'FAIL', error: err.message });
  }

  // 4. RolesGuard rejects PUBLIC role on mutation
  try {
    await ctx.login(USERS.public.email, USERS.public.password);
    const res = await ctx.createPromise({ code: 'PUB-01', titleEn: 'Pub Prom', titleBn: 'প্রমিস' });
    assertStatusCode(res, 403, 'Public role must be forbidden');
    results.push({ name: 'RolesGuard denies PUBLIC role for privileged mutations (403)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'RolesGuard denies PUBLIC role for privileged mutations (403)', status: 'FAIL', error: err.message });
  }

  // 5. RolesGuard allows RESEARCHER to submit evidence
  try {
    await ctx.login(USERS.researcher.email, USERS.researcher.password);
    const res = await ctx.createEvidence({
      promiseId: 'prom-1',
      title: 'Field Study',
      url: 'https://example.com/study',
      sourceType: 'INSTITUTIONAL_REPORT',
      sourceTier: 'TIER_2'
    });
    assertStatusCode(res, 201, 'Researcher should be permitted to submit evidence');
    results.push({ name: 'RolesGuard permits RESEARCHER role for evidence submission (201)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'RolesGuard permits RESEARCHER role for evidence submission (201)', status: 'FAIL', error: err.message });
  }

  // 6. RolesGuard blocks RESEARCHER from approving evidence (ADMIN-only)
  try {
    await ctx.login(USERS.researcher.email, USERS.researcher.password);
    const res = await ctx.reviewEvidence('ev-1', { status: 'APPROVED' });
    assertStatusCode(res, 403, 'Researcher should not be permitted to approve evidence');
    results.push({ name: 'RolesGuard denies RESEARCHER from approving evidence (403)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'RolesGuard denies RESEARCHER from approving evidence (403)', status: 'FAIL', error: err.message });
  }

  return results;
}
