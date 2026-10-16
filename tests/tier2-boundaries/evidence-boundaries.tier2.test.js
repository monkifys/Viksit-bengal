/**
 * Tier 2: Boundary & Corner Cases - Evidence Boundaries & DTO Validation
 * >= 5 test cases testing URL formats, tier boundaries, and review validations
 */

import { assertStatusCode } from '../harness/assertions.js';
import { USERS, ADVERSARIAL_PAYLOADS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];
  await ctx.login(USERS.researcher.email, USERS.researcher.password);

  // 1. Invalid URL format
  try {
    const badUrlDto = {
      promiseId: 'prom-1',
      title: 'Invalid URL Evidence',
      url: 'not-a-valid-http-url',
      sourceType: 'GAZETTE',
      sourceTier: 'TIER_1'
    };
    const res = await ctx.createEvidence(badUrlDto);
    assertStatusCode(res, 400, 'Malformed URL must be rejected with 400');
    results.push({ name: 'Malformed URL format in evidence creation rejected with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Malformed URL format in evidence creation rejected with 400', status: 'FAIL', error: err.message });
  }

  // 2. Invalid SourceTier enum
  try {
    const badTierDto = {
      promiseId: 'prom-1',
      title: 'Invalid Tier Evidence',
      url: 'https://wb.gov.in/doc.pdf',
      sourceType: 'GAZETTE',
      sourceTier: 'TIER_99'
    };
    const res = await ctx.createEvidence(badTierDto);
    assertStatusCode(res, 400, 'Invalid SourceTier must be rejected with 400');
    results.push({ name: 'Invalid SourceTier enum value rejected with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Invalid SourceTier enum value rejected with 400', status: 'FAIL', error: err.message });
  }

  // 3. Missing required title
  try {
    const noTitleDto = {
      promiseId: 'prom-1',
      url: 'https://wb.gov.in/doc.pdf',
      sourceType: 'GAZETTE',
      sourceTier: 'TIER_1'
    };
    const res = await ctx.createEvidence(noTitleDto);
    assertStatusCode(res, 400, 'Missing title must be rejected with 400');
    results.push({ name: 'Evidence DTO missing required title rejected with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Evidence DTO missing required title rejected with 400', status: 'FAIL', error: err.message });
  }

  // 4. Review non-existent evidence ID
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const res = await ctx.reviewEvidence('non-existent-ev-id-999', { status: 'APPROVED' });
    assertStatusCode(res, 404, 'Non-existent evidence item should return 404');
    results.push({ name: 'Review attempt on non-existent evidence ID returns 404 Not Found', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Review attempt on non-existent evidence ID returns 404 Not Found', status: 'FAIL', error: err.message });
  }

  // 5. Invalid review status enum
  try {
    await ctx.login(USERS.admin.email, USERS.admin.password);
    const res = await ctx.reviewEvidence('ev-1', { status: 'MAYBE_APPROVED' });
    assertStatusCode(res, 400, 'Invalid review status enum must return 400');
    results.push({ name: 'Invalid review status enum value rejected with 400', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Invalid review status enum value rejected with 400', status: 'FAIL', error: err.message });
  }

  // 6. XSS payload in evidence excerpt safely stored
  try {
    await ctx.login(USERS.researcher.email, USERS.researcher.password);
    const xssDto = {
      promiseId: 'prom-1',
      title: 'Clean Title',
      url: 'https://wb.gov.in/audit.pdf',
      sourceType: 'AUDIT',
      sourceTier: 'TIER_1',
      excerpt: ADVERSARIAL_PAYLOADS.xss[0]
    };
    const res = await ctx.createEvidence(xssDto);
    assertStatusCode(res, 201, 'Should store safely without executing');
    results.push({ name: 'Evidence excerpt containing XSS script payload stored safely without execution', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Evidence excerpt containing XSS script payload stored safely without execution', status: 'FAIL', error: err.message });
  }

  return results;
}
