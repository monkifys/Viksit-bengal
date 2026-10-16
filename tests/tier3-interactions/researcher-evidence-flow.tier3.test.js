/**
 * Tier 3: Cross-Feature Interactions - Researcher Evidence Flow & Admin Approval
 * Pairwise: Researcher Upload -> Pending State -> Admin Approval -> Approved Evidence Retrieval
 */

import { assertEqual, assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  try {
    // Step 1: Researcher logs in
    const resLogin = await ctx.login(USERS.researcher.email, USERS.researcher.password);
    assertStatusCode(resLogin, 200, 'Researcher login succeeded');

    // Step 2: Researcher submits evidence item
    const uploadRes = await ctx.createEvidence({
      promiseId: 'prom-1',
      title: 'State Budgetary Outlay 2026-27 Book 2',
      url: 'https://finance.wb.gov.in/budget2026/book2.pdf',
      sourceType: 'BUDGET',
      sourceTier: 'TIER_1',
      excerpt: 'Budget line item 4820 allocated INR 12,000 Crores for corridor development'
    });
    assertStatusCode(uploadRes, 201, 'Evidence uploaded successfully');
    assertEqual(uploadRes.data.status, 'PENDING', 'Initial state must be PENDING');
    const evidenceId = uploadRes.data.id;

    // Step 3: Admin logs in to review
    const adminLogin = await ctx.login(USERS.admin.email, USERS.admin.password);
    assertStatusCode(adminLogin, 200, 'Admin login succeeded');

    // Step 4: Admin reviews and approves the evidence
    const reviewRes = await ctx.reviewEvidence(evidenceId, {
      status: 'APPROVED',
      reviewComment: 'Verified against Finance Department Demand for Grants 2026'
    });
    assertStatusCode(reviewRes, 200, 'Evidence review approved');
    assertEqual(reviewRes.data.status, 'APPROVED', 'Evidence status transitioned to APPROVED');

    // Step 5: Verify approved evidence is retrievable via public/researcher query
    const evidenceListRes = await ctx.getEvidence({ promiseId: 'prom-1', status: 'APPROVED' });
    assertStatusCode(evidenceListRes, 200, 'Evidence list retrieved');
    const found = evidenceListRes.data.find(e => e.id === evidenceId);
    if (!found) {
      throw new Error('Newly approved evidence item not found in filtered query');
    }
    assertEqual(found.status, 'APPROVED', 'Verified status in list query is APPROVED');

    results.push({ name: 'Pairwise: Researcher uploads evidence -> Admin approves -> Approved evidence query reflects update', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Pairwise: Researcher uploads evidence -> Admin approves -> Approved evidence query reflects update', status: 'FAIL', error: err.message });
  }

  return results;
}
