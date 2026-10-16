/**
 * Tier 3: Cross-Feature Interactions - CMS Role Boundaries & Privilege Enforcement
 * Pairwise: Anonymous -> Public -> Researcher -> Admin Authorization Escalation Guards
 */

import { assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  try {
    // 1. Anonymous attempts status update
    ctx.setToken(null);
    const anonRes = await ctx.updatePromiseStatus('INFRA-01', { status: 'DELIVERED' });
    assertStatusCode(anonRes, 401, 'Anonymous status update rejected');

    // 2. Public user attempts status update
    await ctx.login(USERS.public.email, USERS.public.password);
    const pubRes = await ctx.updatePromiseStatus('INFRA-01', { status: 'DELIVERED' });
    assertStatusCode(pubRes, 403, 'Public role status update rejected with 403');

    // 3. Researcher attempts admin-only status update
    await ctx.login(USERS.researcher.email, USERS.researcher.password);
    const resStatusRes = await ctx.updatePromiseStatus('INFRA-01', { status: 'DELIVERED' });
    assertStatusCode(resStatusRes, 403, 'Researcher role status update rejected with 403');

    // 4. Researcher submits valid evidence
    const resEvRes = await ctx.createEvidence({
      promiseId: 'prom-1',
      title: 'Public Infrastructure Review',
      url: 'https://wb.gov.in/review.pdf',
      sourceType: 'STATISTICAL_RELEASE',
      sourceTier: 'TIER_2'
    });
    assertStatusCode(resEvRes, 201, 'Researcher evidence submission succeeds with 201');
    const evId = resEvRes.data.id;

    // 5. Researcher attempts to approve own evidence
    const selfReviewRes = await ctx.reviewEvidence(evId, { status: 'APPROVED' });
    assertStatusCode(selfReviewRes, 403, 'Researcher cannot approve evidence (403)');

    // 6. Admin logs in and approves evidence
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const adminApproveRes = await ctx.reviewEvidence(evId, { status: 'APPROVED' });
    assertStatusCode(adminApproveRes, 200, 'Admin approves evidence with 200');

    results.push({ name: 'Pairwise: Multi-role privilege barriers enforce strict authorization boundaries across all tiers', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Pairwise: Multi-role privilege barriers enforce strict authorization boundaries across all tiers', status: 'FAIL', error: err.message });
  }

  return results;
}
