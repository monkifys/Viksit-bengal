/**
 * Tier 2: Boundary & Corner Cases - Indicators & Economic Boundaries
 * >= 5 test cases testing numeric types, year ranges, precision, and error handling
 */

import { assertEqual, assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];
  await ctx.login(USERS.admin.email, USERS.admin.password);

  // 1. String instead of number for year
  try {
    const res = await ctx.createIndicatorValue('GSDP_GROWTH', { year: '2026', value: 8.5 });
    // DTO validation requires year: number
    assertStatusCode(res, 400, 'String year must be rejected by numeric validation');
    results.push({ name: 'String year input rejected by DTO validation with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'String year input rejected by DTO validation with 400', status: 'FAIL', error: err.message });
  }

  // 2. String instead of number for value
  try {
    const res = await ctx.createIndicatorValue('GSDP_GROWTH', { year: 2026, value: 'eight_percent' });
    assertStatusCode(res, 400, 'Non-numeric value must be rejected with 400');
    results.push({ name: 'Non-numeric indicator value rejected by DTO validation with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Non-numeric indicator value rejected by DTO validation with 400', status: 'FAIL', error: err.message });
  }

  // 3. Unknown indicator code returns 404
  try {
    const res = await ctx.createIndicatorValue('NON_EXISTENT_METRIC', { year: 2026, value: 100 });
    assertStatusCode(res, 404, 'Unknown indicator should return 404');
    results.push({ name: 'Data entry for non-existent indicator code returns 404 Not Found', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Data entry for non-existent indicator code returns 404 Not Found', status: 'FAIL', error: err.message });
  }

  // 4. High-precision decimal preservation
  try {
    const highPrecisionValue = 8.42875;
    const res = await ctx.createIndicatorValue('GSDP_GROWTH', { year: 2028, value: highPrecisionValue });
    assertStatusCode(res, 201, 'Decimal creation should succeed');
    assertEqual(res.data.value, highPrecisionValue, 'High-precision decimal preserved');
    results.push({ name: 'Decimal precision in economic growth rate preserved accurately', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Decimal precision in economic growth rate preserved accurately', status: 'FAIL', error: err.message });
  }

  // 5. Zero value edge case
  try {
    const res = await ctx.createIndicatorValue('GSDP_GROWTH', { year: 2029, value: 0 });
    assertStatusCode(res, 201, 'Zero value should be accepted as valid metric point');
    assertEqual(res.data.value, 0, 'Zero value stored');
    results.push({ name: 'Zero value metric (0.0%) accepted as valid economic data point', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Zero value metric (0.0%) accepted as valid economic data point', status: 'FAIL', error: err.message });
  }

  // 6. Large GSDP economic figure ($1 Trillion = 1000 Billion)
  try {
    const res = await ctx.createIndicatorValue('TRILLION_USD_PROGRESS', { year: 2035, value: 1000.0 });
    assertStatusCode(res, 201, '$1T target figure accepted');
    assertEqual(res.data.value, 1000.0, 'Target milestone of 1000B USD accepted');
    results.push({ name: 'Large scale economic milestone figure ($1,000B USD) handled safely', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Large scale economic milestone figure ($1,000B USD) handled safely', status: 'FAIL', error: err.message });
  }

  return results;
}
