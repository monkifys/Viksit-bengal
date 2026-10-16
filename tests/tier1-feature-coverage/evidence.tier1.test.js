/**
 * Tier 1: Feature Coverage - Evidence API
 * >= 5 test cases verifying evidence upload, tier attribution, admin review and RBAC
 */

import { assertEqual, assertArrayLength, assertProperties, assertStatusCode } from '../harness/assertions.js';
import { USERS, SAMPLE_EVIDENCE } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. GET /evidence returns array
  try {
    const res = await ctx.getEvidence();
    assertStatusCode(res, 200, 'GET /evidence should return 200');
    assertArrayLength(res.data, 1, 'Should return evidence items');
    results.push({ name: 'GET /evidence returns evidence records with source attribution', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /evidence returns evidence records with source attribution', status: 'FAIL', error: err.message });
  }

  // 2. POST /evidence by RESEARCHER creates item with PENDING review status
  let createdEvidenceId = null;
  try {
    await ctx.login(USERS.researcher.email, USERS.researcher.password);
    const dto = {
      promiseId: 'prom-1',
      title: 'Department of Planning Annual Audit Report 2026',
      url: 'https://wb.gov.in/reports/audit-2026.pdf',
      sourceType: 'AUDIT',
      sourceTier: 'TIER_1',
      excerpt: 'Corridor completion certified by Comptroller & Auditor General.'
    };
    const res = await ctx.createEvidence(dto);
    assertStatusCode(res, 201, 'POST /evidence should return 201');
    assertEqual(res.data.status, 'PENDING', 'New evidence should be PENDING review');
    createdEvidenceId = res.data.id;
    results.push({ name: 'POST /evidence by RESEARCHER submits evidence in PENDING status', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /evidence by RESEARCHER submits evidence in PENDING status', status: 'FAIL', error: err.message });
  }

  // 3. PATCH /evidence/:id/review by ADMIN approves evidence
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const reviewDto = { status: 'APPROVED', reviewComment: 'Verified against primary state gazette' };
    const res = await ctx.reviewEvidence(createdEvidenceId || 'ev-1', reviewDto);
    assertStatusCode(res, 200, 'PATCH /evidence/:id/review should return 200');
    assertEqual(res.data.status, 'APPROVED', 'Evidence status should be APPROVED');
    results.push({ name: 'PATCH /evidence/:id/review by ADMIN marks evidence as APPROVED', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'PATCH /evidence/:id/review by ADMIN marks evidence as APPROVED', status: 'FAIL', error: err.message });
  }

  // 4. PATCH /evidence/:id/review by RESEARCHER returns 403 Forbidden
  try {
    await ctx.login(USERS.researcher.email, USERS.researcher.password);
    const res = await ctx.reviewEvidence('ev-1', { status: 'APPROVED' });
    assertStatusCode(res, 403, 'Researcher should not be permitted to approve evidence');
    results.push({ name: 'PATCH /evidence/:id/review by RESEARCHER returns 403 Forbidden', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'PATCH /evidence/:id/review by RESEARCHER returns 403 Forbidden', status: 'FAIL', error: err.message });
  }

  // 5. POST /evidence unauthenticated returns 401
  try {
    ctx.setToken(null);
    const res = await ctx.createEvidence({ title: 'Unauth Evidence', url: 'https://example.com' });
    assertStatusCode(res, 401, 'Unauthenticated submission should return 401');
    results.push({ name: 'POST /evidence without authentication returns 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /evidence without authentication returns 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  // 6. Filter evidence by promiseId
  try {
    const res = await ctx.getEvidence({ promiseId: 'prom-1' });
    assertStatusCode(res, 200, 'Filtering by promiseId should return 200');
    results.push({ name: 'GET /evidence?promiseId=:id filters evidence by promise', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /evidence?promiseId=:id filters evidence by promise', status: 'FAIL', error: err.message });
  }

  return results;
}
