/**
 * Tier 4: Real-World Scenarios - Scenario 1: State Administrator End-to-End Governance Lifecycle
 * Complete user journey:
 * 1. Admin login
 * 2. Create strategic manifesto promise
 * 3. Lifecycle stage progression (ANNOUNCED -> FUNDED -> UNDER_IMPLEMENTATION -> DELIVERED)
 * 4. Evidence audit & approval
 * 5. Macroeconomic metric update
 * 6. Verification of state dashboard aggregation
 */

import { assert, assertEqual, assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  try {
    // 1. Admin logs in
    const login = await ctx.login(USERS.admin.email, USERS.admin.password);
    assertStatusCode(login, 200, 'Admin authenticated');

    // 2. Create promise
    const pCode = `SCENARIO-ADMIN-${Date.now()}`;
    const createRes = await ctx.createPromise({
      code: pCode,
      categoryId: 'cat-ports',
      titleEn: 'Tajpur Deep Sea Port Development',
      titleBn: 'তাজপুর গভীর সমুদ্র বন্দর নির্মাণ',
      descriptionEn: 'Construction of deep draft seaport to anchor maritime trade for eastern India.',
      descriptionBn: 'পূর্ব ভারতের সামুদ্রিক বাণিজ্যের কেন্দ্র হিসেবে গভীর সমুদ্র বন্দর নির্মাণ।',
      status: 'ANNOUNCED',
      confidence: 'A',
      isKeyPromise: true,
      keyPromiseNumber: 5
    });
    assertStatusCode(createRes, 201, 'Tajpur Port promise created');

    // 3. Progress status through stages
    await ctx.updatePromiseStatus(pCode, { status: 'FUNDED', comment: 'State equity outlay sanctioned' });
    await ctx.updatePromiseStatus(pCode, { status: 'UNDER_IMPLEMENTATION', comment: 'Breakwater and dredging operational' });
    const finalStatusRes = await ctx.updatePromiseStatus(pCode, { status: 'DELIVERED', comment: 'First commercial vessel berthed' });
    assertEqual(finalStatusRes.data.status, 'DELIVERED', 'Promise delivered');

    // 4. Evidence upload and review
    const evRes = await ctx.createEvidence({
      promiseId: pCode,
      title: 'Port Inauguration Gazette WB-2026-Port',
      url: 'https://wb.gov.in/gazette/ports/tajpur.pdf',
      sourceType: 'GAZETTE',
      sourceTier: 'TIER_1',
      excerpt: 'Commercial shipping operations commenced under Port Trust Notification.'
    });
    assertStatusCode(evRes, 201, 'Port evidence submitted');
    
    const reviewRes = await ctx.reviewEvidence(evRes.data.id, {
      status: 'APPROVED',
      reviewComment: 'Verified by Chief Secretary Maritime Board'
    });
    assertEqual(reviewRes.data.status, 'APPROVED', 'Evidence approved');

    // 5. Update macroeconomic indicator for state growth
    const indRes = await ctx.createIndicatorValue('TRILLION_USD_PROGRESS', {
      year: 2026,
      value: 250.0,
      scenario: 'AMBITIOUS'
    });
    assertStatusCode(indRes, 201, 'GSDP progress updated');

    // 6. Verify full promise detail reflects complete audit trail
    const detail = await ctx.getPromiseByCode(pCode);
    assert(detail.data.statusHistory.length >= 4, 'Timeline tracks all 4 governance stages');
    assertEqual(detail.data.status, 'DELIVERED', 'Final status is DELIVERED');

    results.push({ name: 'Scenario 1: State Administrator End-to-End Governance Lifecycle completed successfully', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Scenario 1: State Administrator End-to-End Governance Lifecycle completed successfully', status: 'FAIL', error: err.message });
  }

  return results;
}
