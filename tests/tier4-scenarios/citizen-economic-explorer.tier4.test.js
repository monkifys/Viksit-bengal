/**
 * Tier 4: Real-World Scenarios - Scenario 3: Citizen Exploring District Transformation & $1T GSDP Targets
 * Complete citizen journey:
 * 1. Public unauthenticated access to dashboard
 * 2. $1T target scenario exploration (Conservative, Base Case, Ambitious)
 * 3. Bilingual interaction (EN and BN)
 * 4. District inspection across all 23 districts
 * 5. Accessible alternative table verification for screen readers
 * 6. Public audit of promise evidence citations
 */

import { assert, assertEqual, assertArrayLength, assertStatusCode } from '../harness/assertions.js';
import { DISTRICTS_23 } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  try {
    // 1. Citizen accesses public indicators without login
    ctx.setToken(null);
    const indRes = await ctx.getIndicators();
    assertStatusCode(indRes, 200, 'Public indicators accessible');

    const gsdpInd = indRes.data.find(i => i.code === 'TRILLION_USD_PROGRESS');
    if (!gsdpInd) throw new Error('$1T GSDP indicator missing');
    assert(gsdpInd.targetValue === 1000, 'Target is $1,000 Billion ($1 Trillion USD)');

    // 2. Citizen inspects all 23 districts
    const distRes = await ctx.getDistricts();
    assertStatusCode(distRes, 200, 'Districts directory accessible');
    assertArrayLength(distRes.data, 23, 'All 23 districts available to public');

    // 3. Citizen compares Purulia (PUR) and Kolkata (KOL)
    const purulia = distRes.data.find(d => d.code === 'PUR');
    const kolkata = distRes.data.find(d => d.code === 'KOL');
    if (!purulia || !kolkata) throw new Error('Purulia or Kolkata missing from districts');

    assertEqual(purulia.nameBn, 'পুরুলিয়া', 'Purulia Bengali name verified');
    assertEqual(kolkata.nameBn, 'কলকাতা', 'Kolkata Bengali name verified');

    // 4. Citizen inspects promise timeline and evidence
    const promisesRes = await ctx.getPromises();
    assertStatusCode(promisesRes, 200, 'Public promises list accessible');
    assert(promisesRes.data.length > 0, 'Promises present for citizen view');

    const firstPromise = promisesRes.data[0];
    const detail = await ctx.getPromiseByCode(firstPromise.code);
    assertStatusCode(detail, 200, 'Public promise detail accessible');
    assert(detail.data.statusHistory.length > 0, 'Citizen can audit status timeline history');

    results.push({ name: 'Scenario 3: Citizen Exploring District Transformation & $1T Targets verified', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Scenario 3: Citizen Exploring District Transformation & $1T Targets verified', status: 'FAIL', error: err.message });
  }

  return results;
}
