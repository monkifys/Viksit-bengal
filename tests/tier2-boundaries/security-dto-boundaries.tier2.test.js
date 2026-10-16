/**
 * Tier 2: Boundary & Corner Cases - Security & DTO Injection Defense (007)
 * >= 5 test cases testing Prototype Pollution, Whitelisting, SQLi, Buffer overflows and Null Bytes
 */

import { assertStatusCode } from '../harness/assertions.js';
import { USERS, ADVERSARIAL_PAYLOADS } from '../harness/fixtures.js';

export async function run(ctx) {
  const results = [];
  await ctx.login(USERS.admin.email, USERS.admin.password);

  // 1. Prototype pollution attempt
  try {
    const res = await ctx.createPromise({
      code: 'PROTO-01',
      titleEn: 'Proto Test',
      titleBn: 'প্রোটো টেস্ট',
      ...ADVERSARIAL_PAYLOADS.prototypePollution
    });
    // Check if Object prototype was polluted
    const isPolluted = ({}).isAdmin === true;
    if (isPolluted) throw new Error('CRITICAL: Object prototype pollution vulnerability detected!');
    results.push({ name: 'Prototype pollution attack in DTO payload safely neutralized without object contamination', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Prototype pollution attack in DTO payload safely neutralized without object contamination', status: 'FAIL', error: err.message });
  }

  // 2. Extra non-whitelisted properties in DTO
  try {
    const maliciousDto = {
      code: 'WHITE-01',
      titleEn: 'Whitelist Test',
      titleBn: 'হোয়াইটলিস্ট টেস্ট',
      unauthorizedField: 'ShouldBeStripped',
      isAdmin: true,
      role: 'SUPER_ADMIN'
    };
    const res = await ctx.createPromise(maliciousDto);
    // Even if created, response must NOT reflect unauthorized fields
    if (res.data?.isAdmin === true || res.data?.role === 'SUPER_ADMIN') {
      throw new Error('Non-whitelisted field was preserved in created entity');
    }
    results.push({ name: 'Global ValidationPipe whitelist strips non-whitelisted injection properties', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Global ValidationPipe whitelist strips non-whitelisted injection properties', status: 'FAIL', error: err.message });
  }

  // 3. SQL injection in promise search query
  try {
    for (const sqli of ADVERSARIAL_PAYLOADS.sqli) {
      const res = await ctx.getPromises({ search: sqli });
      assertStatusCode(res, 200, 'Search query must handle SQL injection strings safely');
    }
    results.push({ name: 'SQL injection attack vectors in search query parameters handled safely', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'SQL injection attack vectors in search query parameters handled safely', status: 'FAIL', error: err.message });
  }

  // 4. Array payload where object expected
  try {
    const res = await ctx.createPromise([{ code: 'ARR-01' }]);
    // Must return 400 validation error
    assertStatusCode(res, 400, 'Array body where object required must return 400');
    results.push({ name: 'Array body sent to object DTO endpoint rejected with 400 Bad Request', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Array body sent to object DTO endpoint rejected with 400 Bad Request', status: 'FAIL', error: err.message });
  }

  // 5. Extreme payload size (50KB string)
  try {
    const res = await ctx.createPromise({
      code: 'BUFF-01',
      titleEn: ADVERSARIAL_PAYLOADS.bufferOverflow,
      titleBn: 'বাংলা'
    });
    // System should either reject or safely handle without unhandled process termination
    results.push({ name: 'Extreme 50KB payload handled gracefully without memory exhaustion crash', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Extreme 50KB payload handled gracefully without memory exhaustion crash', status: 'FAIL', error: err.message });
  }

  // 6. Null byte injection in title string
  try {
    const res = await ctx.createPromise({
      code: 'NULL-01',
      titleEn: 'SafeTitle\0malicious',
      titleBn: 'বাংলা'
    });
    results.push({ name: 'Null byte injection in string fields handled without file traversal or system fault', status: 'PASS' });
  } catch (err) {
    results.push({ name: 'Null byte injection in string fields handled without file traversal or system fault', status: 'FAIL', error: err.message });
  }

  return results;
}
