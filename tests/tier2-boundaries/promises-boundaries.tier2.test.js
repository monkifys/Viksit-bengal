/**
 * Tier 2: Boundary & Corner Cases - Promises Boundaries & DTO Validation
 * >= 5 test cases testing invalid enums, missing mandatory fields, and complex Unicode
 */

import { assertEqual, assertStatusCode } from '../harness/assertions.js';
import { USERS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];
  await ctx.login(USERS.admin.email, USERS.admin.password);

  // 1. Invalid status enum in creation DTO
  try {
    const badDto = {
      code: 'ERR-01',
      titleEn: 'Invalid Status Promise',
      titleBn: 'ভুল স্ট্যাটাস প্রমিস',
      status: 'TOTALLY_DELIVERED_SUPER' // Not in enum
    };
    const res = await ctx.createPromise(badDto);
    assertStatusCode(res, 400, 'Invalid status enum must be rejected with 400');
    results.push({ name: 'Invalid status enum in promise creation rejected with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Invalid status enum in promise creation rejected with 400', status: 'FAIL', error: err.message });
  }

  // 2. Missing titleBn (Bengali localization required)
  try {
    const res = await ctx.createPromise({ code: 'ERR-02', titleEn: 'English Only' });
    assertStatusCode(res, 400, 'Missing mandatory titleBn must be rejected with 400');
    results.push({ name: 'Promise creation with missing titleBn rejected with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Promise creation with missing titleBn rejected with 400', status: 'FAIL', error: err.message });
  }

  // 3. Missing titleEn (English title required)
  try {
    const res = await ctx.createPromise({ code: 'ERR-03', titleBn: 'শুধু বাংলা' });
    assertStatusCode(res, 400, 'Missing mandatory titleEn must be rejected with 400');
    results.push({ name: 'Promise creation with missing titleEn rejected with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Promise creation with missing titleEn rejected with 400', status: 'FAIL', error: err.message });
  }

  // 4. Invalid status in PATCH /promises/:code/status
  try {
    const res = await ctx.updatePromiseStatus('INFRA-01', { status: 'FLYING_HIGH' });
    assertStatusCode(res, 400, 'Invalid status enum in PATCH must return 400');
    results.push({ name: 'Invalid PromiseStatus enum in PATCH status update rejected with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Invalid PromiseStatus enum in PATCH status update rejected with 400', status: 'FAIL', error: err.message });
  }

  // 5. Updating non-existent promise status returns 404
  try {
    const res = await ctx.updatePromiseStatus('NON_EXISTENT_PROMISE_999', { status: 'DELIVERED' });
    assertStatusCode(res, 404, 'Updating non-existent promise should return 404');
    results.push({ name: 'Status update on non-existent promise code returns 404 Not Found', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Status update on non-existent promise code returns 404 Not Found', status: 'FAIL', error: err.message });
  }

  // 6. Complex Bengali unicode ligature integrity
  try {
    const complexBengali = 'পশ্চিমবঙ্গ অর্থনৈতিক করিডোর & টেকনোলজি হাব (২০২৬-২০৩১)';
    const res = await ctx.createPromise({
      code: 'UNICODE-01',
      titleEn: 'WB Tech Hub',
      titleBn: complexBengali,
      status: 'ANNOUNCED'
    });
    assertStatusCode(res, 201, 'Complex unicode creation should succeed');
    assertEqual(res.data.titleBn, complexBengali, 'Bengali unicode characters preserved accurately without mojibake');
    results.push({ name: 'Complex Bengali unicode characters and ligatures preserved without corruption', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Complex Bengali unicode characters and ligatures preserved without corruption', status: 'FAIL', error: err.message });
  }

  return results;
}
