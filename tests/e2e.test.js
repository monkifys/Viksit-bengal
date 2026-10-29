/**
 * End-to-End Test Suite for Viksit Bengal Dashboard
 * Testing live HTTP REST APIs, Public Web Pages, Multi-Language Pages, and Review Flows.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { server } = require('../server.js');

let baseUrl = '';

test.before(async () => {
  await new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

test('E2E - Health Check API & System Metrics', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.status, 'UP');
  assert.equal(data.platform, 'Viksit Bengal Dashboard');
  assert.ok(data.database.promisesCount >= 140);
  assert.equal(data.database.districtsCount, 23);
  assert.ok(data.database.indicatorsCount >= 10);
});

test('E2E - Public Bilingual Web Pages Availability', async () => {
  // English Homepage
  const enRes = await fetch(`${baseUrl}/`);
  assert.equal(enRes.status, 200);
  const enHtml = await enRes.text();
  assert.ok(enHtml.includes('Viksit Bengal Dashboard'));
  assert.ok(enHtml.includes('Economy'));

  // Bengali Homepage
  const bnRes = await fetch(`${baseUrl}/bn/`);
  assert.equal(bnRes.status, 200);
  const bnHtml = await bnRes.text();
  assert.ok(bnHtml.includes('বিকশিত বাংলা'));

  // Economy & Target Calculator
  const ecoRes = await fetch(`${baseUrl}/economy.html`);
  assert.equal(ecoRes.status, 200);
  const ecoHtml = await ecoRes.text();
  assert.ok(ecoHtml.includes('Target Calculator'));

  // Society Dashboard
  const socRes = await fetch(`${baseUrl}/society.html`);
  assert.equal(socRes.status, 200);

  // Districts Explorer
  const distRes = await fetch(`${baseUrl}/districts.html`);
  assert.equal(distRes.status, 200);

  // Projects Registry
  const projRes = await fetch(`${baseUrl}/projects.html`);
  assert.equal(projRes.status, 200);

  // Citizen Evidence Submission Portal
  const subRes = await fetch(`${baseUrl}/submit.html`);
  assert.equal(subRes.status, 200);

  // Methodology & Standards
  const methRes = await fetch(`${baseUrl}/methodology.html`);
  assert.equal(methRes.status, 200);

  // Admin Dashboard
  const adminRes = await fetch(`${baseUrl}/admin.html`);
  assert.equal(adminRes.status, 200);
});

test('E2E - Core REST Data APIs', async () => {
  // 1. Districts API
  const distRes = await fetch(`${baseUrl}/api/districts`);
  assert.equal(distRes.status, 200);
  const districts = await distRes.json();
  assert.equal(districts.length, 23);

  // 2. Indicators API
  const indRes = await fetch(`${baseUrl}/api/indicators`);
  assert.equal(indRes.status, 200);
  const indicators = await indRes.json();
  assert.ok(indicators.length >= 10);

  // 3. Projects API
  const projRes = await fetch(`${baseUrl}/api/projects`);
  assert.equal(projRes.status, 200);
  const projects = await projRes.json();
  assert.ok(projects.length >= 6);

  // 4. Promises API
  const promRes = await fetch(`${baseUrl}/api/promises`);
  assert.equal(promRes.status, 200);
  const promises = await promRes.json();
  assert.ok(promises.length >= 140);
});

test('E2E - Citizen Evidence Submission & Validation', async () => {
  // Test invalid URL validation
  const invalidRes = await fetch(`${baseUrl}/api/evidence/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Invalid submission test',
      explanation: 'Testing missing URL',
      source_url: 'not-a-valid-http-url'
    })
  });
  assert.equal(invalidRes.status, 400);

  // Test valid submission
  const validRes = await fetch(`${baseUrl}/api/evidence/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Purba Medinipur Marine Highway DPR Sanctioned',
      explanation: 'Ministry of Road Transport and Highways sanctioned DPR preparation.',
      source_url: 'https://morth.nic.in/notifications/wb-marine-highway-2026',
      target_type: 'project',
      target_id: 'proj-kalyani-expressway',
      district_id: 'purba_medinipur',
      submitter_name: 'Anirban Das',
      submitter_email: 'anirban@civicbengal.in'
    })
  });
  assert.equal(validRes.status, 201);
  const result = await validRes.json();
  assert.ok(result.success);
  assert.ok(result.submissionId);

  // Send submissions 3 through 5 (to reach the 5-request limit for this IP, since requests 1 and 2 already counted)
  for (let i = 3; i <= 5; i++) {
    const res = await fetch(`${baseUrl}/api/evidence/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Quota filling submission #${i}`,
        explanation: 'Testing rate limit threshold.',
        source_url: `https://morth.nic.in/notifications/test-item-${i}`
      })
    });
    assert.equal(res.status, 201, `Submission ${i} should succeed within quota`);
  }

  // 6th submission within 15 minutes must be rejected with 429 Too Many Requests
  const rateLimitedRes = await fetch(`${baseUrl}/api/evidence/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Should be rejected by rate limiter',
      explanation: 'Rate limit test 6th request.',
      source_url: 'https://morth.nic.in/notifications/rate-limit-blocked'
    })
  });
  assert.equal(rateLimitedRes.status, 429, '6th submission must return 429 Too Many Requests');
  const rateLimitData = await rateLimitedRes.json();
  assert.equal(rateLimitData.success, false);
  assert.ok(rateLimitData.error.includes('Rate limit exceeded'));
  assert.ok(rateLimitedRes.headers.get('retry-after'), 'Retry-After header must be present');
});

test('E2E - Authentication & Role-Based Access Control', async () => {
  // 1. Unauthenticated call to protected endpoint must return 401
  const unauthRes = await fetch(`${baseUrl}/api/audit-logs`);
  assert.equal(unauthRes.status, 401);

  // 2. Failed login with bad password
  const failLogin = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'BadPassword!999' })
  });
  assert.equal(failLogin.status, 401);

  // 3. Successful login as admin
  const loginRes = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  assert.equal(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.ok(loginData.token);
  assert.equal(loginData.session.role, 'admin');

  // 4. Authorized access with token
  const authLogsRes = await fetch(`${baseUrl}/api/audit-logs`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  assert.equal(authLogsRes.status, 200);
  const logs = await authLogsRes.json();
  assert.ok(Array.isArray(logs));
});

test('E2E - CSV Export & Bulk Ingestion', async () => {
  // 1. Login to get token for export and import
  const loginRes = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const { token } = await loginRes.json();

  // 2. Export Promises CSV with authenticated token
  const exportRes = await fetch(`${baseUrl}/api/export/csv?type=promises`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  assert.equal(exportRes.status, 200);
  assert.ok(exportRes.headers.get('content-type').includes('text/csv'));
  const csvContent = await exportRes.text();
  assert.ok(csvContent.includes('id,category,number,status'));

  // 3. Import valid CSV batch
  const testCsv = [
    'id,category,number,status,text_en,text_bn,keywords',
    'test-civic-1,economy,999,not_started,"Testing civic promise import","পরীক্ষামূলক প্রতিশ্রুতি","civic,test"'
  ].join('\n');

  const importRes = await fetch(`${baseUrl}/api/import/csv?type=promises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ raw: testCsv })
  });
  assert.equal(importRes.status, 200);
  const importResult = await importRes.json();
  assert.ok(importResult.success);
  assert.equal(importResult.imported, 1);
});
