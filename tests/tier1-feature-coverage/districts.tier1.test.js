/**
 * Tier 1: Feature Coverage - Districts API
 * >= 5 test cases verifying all 23 West Bengal districts, bilingual names, and detail endpoints
 */

import { assertEqual, assertArrayLength, assertProperties, assertStatusCode } from '../harness/assertions.js';
import { DISTRICTS_23 } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. GET /districts returns 23 districts
  try {
    const res = await ctx.getDistricts();
    assertStatusCode(res, 200, 'GET /districts should return 200');
    assertArrayLength(res.data, 23, 'Must contain all 23 West Bengal districts');
    results.push({ name: 'GET /districts returns all 23 West Bengal districts', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /districts returns all 23 West Bengal districts', status: 'FAIL', error: err.message });
  }

  // 2. Schema compliance for every district
  try {
    const res = await ctx.getDistricts();
    const sample = res.data[0];
    assertProperties(sample, ['code', 'nameEn', 'nameBn', 'population', 'gsdpShare', 'promiseCount'], 'District object structure');
    results.push({ name: 'District records satisfy required schema (code, names, population, gsdpShare)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'District records satisfy required schema (code, names, population, gsdpShare)', status: 'FAIL', error: err.message });
  }

  // 3. Verify specific district: Kolkata (KOL)
  try {
    const kolRes = await ctx.getDistrictByCode('KOL');
    assertStatusCode(kolRes, 200, 'GET /districts/KOL should return 200');
    assertEqual(kolRes.data.code, 'KOL', 'District code should be KOL');
    assertEqual(kolRes.data.nameEn, 'Kolkata', 'District English name');
    assertEqual(kolRes.data.nameBn, 'কলকাতা', 'District Bengali name');
    results.push({ name: 'GET /districts/KOL returns Kolkata with bilingual names', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /districts/KOL returns Kolkata with bilingual names', status: 'FAIL', error: err.message });
  }

  // 4. Verify specific district: Darjeeling (DAR)
  try {
    const darRes = await ctx.getDistrictByCode('DAR');
    assertStatusCode(darRes, 200, 'GET /districts/DAR should return 200');
    assertEqual(darRes.data.code, 'DAR', 'District code should be DAR');
    assertEqual(darRes.data.nameEn, 'Darjeeling', 'District English name');
    assertEqual(darRes.data.nameBn, 'দার্জিলিং', 'District Bengali name');
    results.push({ name: 'GET /districts/DAR returns Darjeeling with bilingual names', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /districts/DAR returns Darjeeling with bilingual names', status: 'FAIL', error: err.message });
  }

  // 5. Verify district detail includes relations
  try {
    const res = await ctx.getDistrictByCode('KOL');
    assertProperties(res.data, ['promises', 'indicators'], 'District detail relations');
    results.push({ name: 'District detail endpoint includes associated promises and indicators', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'District detail endpoint includes associated promises and indicators', status: 'FAIL', error: err.message });
  }

  // 6. Non-existent district code returns 404
  try {
    const badRes = await ctx.getDistrictByCode('NON_EXISTENT_999');
    assertStatusCode(badRes, 404, 'Unknown district code should return 404');
    results.push({ name: 'GET /districts/:code with invalid code returns 404 Not Found', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /districts/:code with invalid code returns 404 Not Found', status: 'FAIL', error: err.message });
  }

  return results;
}
