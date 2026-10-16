/**
 * Tier 1: Feature Coverage - Promises API
 * >= 5 test cases verifying promise retrieval, filtering, creation, status update and timeline
 */

import { assertEqual, assertArrayLength, assertProperties, assertStatusCode } from '../harness/assertions.js';
import { USERS, SAMPLE_PROMISE } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];

  // 1. GET /promises returns array
  try {
    const res = await ctx.getPromises();
    assertStatusCode(res, 200, 'GET /promises should return 200');
    assertArrayLength(res.data, 1, 'Should return promises list');
    results.push({ name: 'GET /promises returns list of government promises', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /promises returns list of government promises', status: 'FAIL', error: err.message });
  }

  // 2. GET /promises with status query
  try {
    const res = await ctx.getPromises({ status: 'UNDER_IMPLEMENTATION' });
    assertStatusCode(res, 200, 'Status filter should return 200');
    results.push({ name: 'GET /promises?status=UNDER_IMPLEMENTATION correctly filters promises', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /promises?status=UNDER_IMPLEMENTATION correctly filters promises', status: 'FAIL', error: err.message });
  }

  // 3. GET /promises/:code detail
  try {
    const res = await ctx.getPromiseByCode('INFRA-01');
    assertStatusCode(res, 200, 'GET /promises/:code should return 200');
    assertProperties(res.data, ['code', 'titleEn', 'titleBn', 'status', 'statusHistory'], 'Promise details');
    results.push({ name: 'GET /promises/:code returns promise details and statusHistory timeline', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'GET /promises/:code returns promise details and statusHistory timeline', status: 'FAIL', error: err.message });
  }

  // 4. POST /promises authenticated as ADMIN
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const newPromiseDto = {
      code: 'AGRI-02',
      categoryId: 'cat-agri',
      titleEn: 'Smart Irrigation Modernization Project',
      titleBn: 'স্মার্ট সেচ আধুনিকীকরণ প্রকল্প',
      status: 'ANNOUNCED',
      confidence: 'B',
      isKeyPromise: false
    };
    const res = await ctx.createPromise(newPromiseDto);
    assertStatusCode(res, 201, 'POST /promises should return 201');
    assertEqual(res.data.code, 'AGRI-02', 'Created promise code');
    results.push({ name: 'POST /promises creates a new promise when authenticated as ADMIN', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /promises creates a new promise when authenticated as ADMIN', status: 'FAIL', error: err.message });
  }

  // 5. PATCH /promises/:code/status by ADMIN
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const updateDto = { status: 'DELIVERED', comment: 'All corridor segments operational' };
    const res = await ctx.updatePromiseStatus('INFRA-01', updateDto);
    assertStatusCode(res, 200, 'PATCH /promises/:code/status should return 200');
    assertEqual(res.data.status, 'DELIVERED', 'Updated status');
    results.push({ name: 'PATCH /promises/:code/status updates lifecycle status and appends timeline entry', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'PATCH /promises/:code/status updates lifecycle status and appends timeline entry', status: 'FAIL', error: err.message });
  }

  // 6. POST /promises unauthenticated returns 401
  try {
    ctx.setToken(null);
    const unauthRes = await ctx.createPromise({ code: 'UNAUTH-01', titleEn: 'Test', titleBn: 'পরীক্ষা' });
    assertStatusCode(unauthRes, 401, 'Unauthenticated mutation should fail');
    results.push({ name: 'POST /promises without authentication returns 401 Unauthorized', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'POST /promises without authentication returns 401 Unauthorized', status: 'FAIL', error: err.message });
  }

  return results;
}
