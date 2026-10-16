/**
 * Tier 3: Cross-Feature Interactions - District & Indicator Aggregation
 * Pairwise: Indicator Value Creation -> District Detail Aggregation -> Economic Projection
 */

import { assertEqual, assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  try {
    // Step 1: Admin logs in
    await ctx.login(USERS.admin.email, USERS.admin.password);

    // Step 2: Post a new indicator value for state growth
    const indRes = await ctx.createIndicatorValue('GSDP_GROWTH', {
      year: 2026,
      value: 8.9,
      targetValue: 12.0
    });
    assertStatusCode(indRes, 201, 'Indicator value successfully created');

    // Step 3: Fetch district detail for Kolkata (KOL)
    const distRes = await ctx.getDistrictByCode('KOL');
    assertStatusCode(distRes, 200, 'District detail retrieved');

    // Step 4: Verify district data incorporates indicator and promise aggregations
    if (!distRes.data.indicators || !Array.isArray(distRes.data.indicators)) {
      throw new Error('District detail response does not contain indicators collection');
    }
    const growthMetric = distRes.data.indicators.find(i => i.code === 'GSDP_GROWTH');
    if (!growthMetric) {
      throw new Error('GSDP_GROWTH indicator not present in district economic context');
    }
    assertEqual(growthMetric.currentValue, 8.9, 'District metric reflects latest growth rate');

    results.push({ name: 'Pairwise: Indicator data point updates state context reflected in District economic detail', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Pairwise: Indicator data point updates state context reflected in District economic detail', status: 'FAIL', error: err.message });
  }

  return results;
}
