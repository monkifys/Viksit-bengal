/**
 * Tier 2: Boundary & Corner Cases - Districts Boundaries
 * >= 5 test cases testing malformed identifiers, case-insensitivity, and SQL injection safety
 */

import { assertEqual, assertStatusCode } from '../harness/assertions.js';
import { ADVERSARIAL_PAYLOADS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. SQL injection in district code
  try {
    const res = await ctx.getDistrictByCode(ADVERSARIAL_PAYLOADS.sqli[0]);
    assertStatusCode(res, 404, 'SQL injection attempt in district code must return 404/400 cleanly');
    results.push({ name: 'SQL injection payload in district code parameter returns 404 cleanly', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'SQL injection payload in district code parameter returns 404 cleanly', status: 'FAIL', error: err.message });
  }

  // 2. Case-insensitivity (kol -> KOL)
  try {
    const res = await ctx.getDistrictByCode('kol');
    assertStatusCode(res, 200, 'District lookup should be case-insensitive');
    assertEqual(res.data.code, 'KOL', 'Returns Kolkata');
    results.push({ name: 'District code parameter is case-insensitive (kol resolves to KOL)', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'District code parameter is case-insensitive (kol resolves to KOL)', status: 'FAIL', error: err.message });
  }

  // 3. Excessively long district code (> 100 characters)
  try {
    const longCode = 'X'.repeat(250);
    const res = await ctx.getDistrictByCode(longCode);
    assertStatusCode(res, 404, 'Extreme code length must return 404 cleanly without server error');
    results.push({ name: 'Excessively long district code string handled safely without buffer crash', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Excessively long district code string handled safely without buffer crash', status: 'FAIL', error: err.message });
  }

  // 4. Special URL-encoded characters
  try {
    const res = await ctx.getDistrictByCode('@@--%%**');
    assertStatusCode(res, 404, 'Special characters must return 404 safely');
    results.push({ name: 'Special punctuation symbols in district code return 404 safely', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Special punctuation symbols in district code return 404 safely', status: 'FAIL', error: err.message });
  }

  // 5. Non-existent district code
  try {
    const res = await ctx.getDistrictByCode('NOT_IN_WEST_BENGAL_007');
    assertStatusCode(res, 404, 'Non-existent district should return 404');
    results.push({ name: 'Non-existent district code returns 404 Not Found', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Non-existent district code returns 404 Not Found', status: 'FAIL', error: err.message });
  }

  // 6. Null byte injection in district code
  try {
    const res = await ctx.getDistrictByCode('KOL\0');
    assertStatusCode(res, 404, 'Null byte injection must return 404');
    results.push({ name: 'Null byte injection in district code handled cleanly', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Null byte injection in district code handled cleanly', status: 'FAIL', error: err.message });
  }

  return results;
}
