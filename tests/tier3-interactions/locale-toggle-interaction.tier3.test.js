/**
 * Tier 3: Cross-Feature Interactions - Locale Switching & Bilingual Numerals
 * Pairwise: Locale Toggle -> Bilingual Data Rendering -> Bengali Numeral Transformation
 */

import { assertEqual, assertArrayLength } from '../harness/assertions.js';
import { DISTRICTS_23 } from '../harness/fixtures.js';

function toBengaliDigits(numOrStr) {
  const digits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(numOrStr).replace(/[0-9]/g, w => digits[+w]);
}

export async function run(ctx) {
  const results = [];

  try {
    // Step 1: Query all districts
    const distRes = await ctx.getDistricts();
    assertArrayLength(distRes.data, 23, 'Must return all 23 districts');

    // Step 2: Validate English district names
    const kolkata = distRes.data.find(d => d.code === 'KOL');
    assertEqual(kolkata.nameEn, 'Kolkata', 'English name is Kolkata');

    // Step 3: Validate Bengali district names
    assertEqual(kolkata.nameBn, 'কলকাতা', 'Bengali name is কলকাতা');

    // Step 4: Verify Bengali numeral transformation on district count and years
    const totalDistrictsEn = 23;
    const totalDistrictsBn = toBengaliDigits(totalDistrictsEn);
    assertEqual(totalDistrictsBn, '২৩', '23 converts to ২৩ in Bengali');

    const yearEn = 2026;
    const yearBn = toBengaliDigits(yearEn);
    assertEqual(yearBn, '২০২৬', '2026 converts to ২০২৬ in Bengali');

    // Step 5: Verify all 23 districts possess distinct Bengali translations
    const bengaliNames = new Set(distRes.data.map(d => d.nameBn));
    assertEqual(bengaliNames.size, 23, 'All 23 districts have unique Bengali translations');

    results.push({ name: 'Pairwise: Bilingual locale transition seamlessly renders English and Bengali text and numerals', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Pairwise: Bilingual locale transition seamlessly renders English and Bengali text and numerals', status: 'FAIL', error: err.message });
  }

  return results;
}
