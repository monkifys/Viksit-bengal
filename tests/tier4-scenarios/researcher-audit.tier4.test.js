/**
 * Tier 4: Real-World Scenarios - Scenario 2: Policy Researcher Evidence Audit
 * Complete user journey:
 * 1. Researcher authentication
 * 2. Manifesto promise search and category exploration
 * 3. Submission of Tier-1 official gazette evidence
 * 4. Validation of source tier and confidence score
 * 5. Verification of PENDING queue state
 * 6. Attempted unauthorized status change strictly prevented by RBAC
 */

import { assertEqual, assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  try {
    // 1. Researcher authentication
    const loginRes = await ctx.login(USERS.researcher.email, USERS.researcher.password);
    assertStatusCode(loginRes, 200, 'Researcher authenticated');

    // 2. Explore promises
    const promisesRes = await ctx.getPromises();
    assertStatusCode(promisesRes, 200, 'Fetched promise registry');

    // 3. Submit evidence
    const evRes = await ctx.createEvidence({
      promiseId: 'prom-1',
      title: 'Comptroller & Auditor General State Performance Audit Report 2026',
      url: 'https://cag.gov.in/en/audit-report/details/119827',
      sourceType: 'AUDIT',
      sourceTier: 'TIER_1',
      excerpt: 'Section 3.2 validates physical completion and expenditure milestones.'
    });
    assertStatusCode(evRes, 201, 'CAG audit evidence submitted');
    assertEqual(evRes.data.sourceTier, 'TIER_1', 'Verified as Tier 1 source');
    assertEqual(evRes.data.status, 'PENDING', 'Queued for admin review');

    // 4. Verify evidence in promise query
    const checkEv = await ctx.getEvidence({ promiseId: 'prom-1' });
    const submitted = checkEv.data.find(e => e.id === evRes.data.id);
    if (!submitted) throw new Error('Submitted evidence not found in registry');

    // 5. Attempt unauthorized status change (Researcher -> cannot mutate status)
    const unauthorizedAttempt = await ctx.updatePromiseStatus('prom-1', { status: 'DELIVERED' });
    assertStatusCode(unauthorizedAttempt, 403, 'Researcher barred from direct promise status alteration');

    results.push({ name: 'Scenario 2: Policy Researcher Evidence Audit and Integrity Controls verified', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Scenario 2: Policy Researcher Evidence Audit and Integrity Controls verified', status: 'FAIL', error: err.message });
  }

  return results;
}
