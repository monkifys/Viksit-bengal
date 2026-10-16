/**
 * Tier 1: Feature Coverage - Indicators & GSDP $1T Targets
 * >= 5 test cases verifying economic indicators, $1T target scenarios and time-series updates
 */

import { assertEqual, assertArrayLength, assertProperties, assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. GET /indicators returns array
  try {
    const res = await ctx.getIndicators();
    assertStatusCode(res, 200, 'GET /indicators should return 200');
    assertArrayLength(res.data, 2, 'Should return indicators array');
    results.push({ name: 'GET /indicators returns state macroeconomic indicators', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /indicators returns state macroeconomic indicators', status: 'FAIL', error: err.message });
  }

  // 2. Indicators schema includes bilingual names and target values
  try {
    const res = await ctx.getIndicators();
    const ind = res.data[0];
    assertProperties(ind, ['code', 'nameEn', 'nameBn', 'unit', 'currentValue'], 'Indicator schema');
    results.push({ name: 'Indicators satisfy bilingual naming and unit definitions', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Indicators satisfy bilingual naming and unit definitions', status: 'FAIL', error: err.message });
  }

  // 3. $1T target scenario modeling
  try {
    const res = await ctx.getIndicators();
    const trillionInd = res.data.find(i => i.code === 'TRILLION_USD_PROGRESS');
    if (!trillionInd) throw new Error('TRILLION_USD_PROGRESS indicator not found');
    const scenarios = trillionInd.values.map(v => v.scenario).filter(Boolean);
    if (!scenarios.includes('CONSERVATIVE') || !scenarios.includes('BASE_CASE') || !scenarios.includes('AMBITIOUS')) {
      throw new Error(`Missing expected scenarios, got: ${scenarios.join(', ')}`);
    }
    results.push({ name: '$1T GSDP progress includes CONSERVATIVE, BASE_CASE, and AMBITIOUS scenarios', status: 'PASS' });
  } catch (err) {
    results.push({ name: '$1T GSDP progress includes CONSERVATIVE, BASE_CASE, and AMBITIOUS scenarios', status: 'FAIL', error: err.message });
  }

  // 4. POST /indicators/:code/values creates time-series record
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const dto = { year: 2026, value: 9.1, targetValue: 12.5 };
    const res = await ctx.createIndicatorValue('GSDP_GROWTH', dto);
    assertStatusCode(res, 201, 'POST /indicators/:code/values should return 201');
    results.push({ name: 'POST /indicators/:code/values appends new temporal data point', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /indicators/:code/values appends new temporal data point', status: 'FAIL', error: err.message });
  }

  // 5. Unauthenticated mutation returns 401
  try {
    ctx.setToken(null);
    const res = await ctx.createIndicatorValue('GSDP_GROWTH', { year: 2027, value: 9.5 });
    assertStatusCode(res, 401, 'Unauthenticated mutation should return 401');
    results.push({ name: 'POST /indicators/:code/values unauthenticated returns 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /indicators/:code/values unauthenticated returns 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  // 6. Unknown indicator code returns 404
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const res = await ctx.createIndicatorValue('UNKNOWN_INDICATOR_XYZ', { year: 2026, value: 10 });
    assertStatusCode(res, 404, 'Unknown indicator code should return 404');
    results.push({ name: 'POST /indicators/:code/values for unknown indicator returns 404 Not Found', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /indicators/:code/values for unknown indicator returns 404 Not Found', status: 'FAIL', error: err.message });
  }

  return results;
}
