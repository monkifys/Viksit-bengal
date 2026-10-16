/**
 * Tier 3: Cross-Feature Interactions - Admin Promise Lifecycle & Timeline
 * Pairwise: Login -> Create Promise -> Lifecycle Transition -> Timeline History -> District Reflection
 */

import { assertEqual, assertStatusCode, assertArrayLength } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  try {
    // Step 1: Admin logs in
    const loginRes = await ctx.login(USERS.admin.email, USERS.admin.password);
    assertStatusCode(loginRes, 200, 'Admin login succeeded');

    // Step 2: Create a key development promise
    const pCode = `PAIRWISE-PROM-${Date.now()}`;
    const createRes = await ctx.createPromise({
      code: pCode,
      categoryId: 'cat-infra',
      titleEn: 'Kolkata Metro Extension to New Town',
      titleBn: 'নিউ টাউনে কলকাতা মেট্রো সম্প্রসারণ',
      status: 'ANNOUNCED',
      isKeyPromise: true,
      keyPromiseNumber: 12
    });
    assertStatusCode(createRes, 201, 'Promise created successfully');

    // Step 3: Advance lifecycle status to UNDER_IMPLEMENTATION
    const underImplRes = await ctx.updatePromiseStatus(pCode, {
      status: 'UNDER_IMPLEMENTATION',
      comment: 'Tenders awarded and tunneling begun'
    });
    assertStatusCode(underImplRes, 200, 'Status updated to UNDER_IMPLEMENTATION');
    assertEqual(underImplRes.data.status, 'UNDER_IMPLEMENTATION', 'Status updated');

    // Step 4: Advance lifecycle to DELIVERED
    const deliveredRes = await ctx.updatePromiseStatus(pCode, {
      status: 'DELIVERED',
      comment: 'Commercial service inaugurated'
    });
    assertStatusCode(deliveredRes, 200, 'Status updated to DELIVERED');
    assertEqual(deliveredRes.data.status, 'DELIVERED', 'Status is DELIVERED');

    // Step 5: Verify statusHistory timeline has tracked all state transitions
    const detailRes = await ctx.getPromiseByCode(pCode);
    assertStatusCode(detailRes, 200, 'Promise detail fetched');
    assertArrayLength(detailRes.data.statusHistory, 3, 'Timeline must record initial creation + 2 updates');
    
    const latestHistory = detailRes.data.statusHistory[detailRes.data.statusHistory.length - 1];
    assertEqual(latestHistory.status, 'DELIVERED', 'Latest timeline entry is DELIVERED');
    assertEqual(latestHistory.comment, 'Commercial service inaugurated', 'Timeline comment preserved');

    results.push({ name: 'Pairwise: Admin creates promise, updates lifecycle stages and verifies audit timeline history', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Pairwise: Admin creates promise, updates lifecycle stages and verifies audit timeline history', status: 'FAIL', error: err.message });
  }

  return results;
}
