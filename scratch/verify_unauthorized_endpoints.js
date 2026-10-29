const baseUrl = 'http://localhost:3000';

async function testUnauthorizedRejection() {
  console.log('Testing that protected administrative endpoints strictly reject unauthorized requests...\n');

  const protectedEndpoints = [
    { method: 'GET', url: '/api/audit-logs' },
    { method: 'GET', url: '/api/status-history' },
    { method: 'GET', url: '/api/evidence/submissions' },
    { method: 'POST', url: '/api/evidence/review', body: { submissionId: 1, status: 'approved' } },
    { method: 'POST', url: '/api/promises', body: { id: 'test-unauth', status: 'not_started' } },
    { method: 'DELETE', url: '/api/promises/test-unauth' },
    { method: 'POST', url: '/api/updates', body: { title_en: 'Unauth update' } },
    { method: 'GET', url: '/api/scraped-queue' },
    { method: 'POST', url: '/api/scraped-queue/approve', body: { candidateId: 1 } },
    { method: 'POST', url: '/api/scraped-queue/reject', body: { candidateId: 1 } },
    { method: 'POST', url: '/api/settings', body: { chief_minister: 'Hacker' } },
    { method: 'GET', url: '/api/export/csv?type=promises' },
    { method: 'GET', url: '/api/export/csv?type=indicators' },
    { method: 'GET', url: '/api/export/csv?type=projects' },
    { method: 'GET', url: '/api/export/csv?type=districts' }
  ];

  let passed = 0;
  let failed = 0;

  for (const ep of protectedEndpoints) {
    // 1. Without any auth header
    const resNoAuth = await fetch(`${baseUrl}${ep.url}`, {
      method: ep.method,
      headers: { 'Content-Type': 'application/json' },
      body: ep.body ? JSON.stringify(ep.body) : undefined
    });

    if (resNoAuth.status === 401) {
      // 2. With forged/invalid bearer token
      const resFakeToken = await fetch(`${baseUrl}${ep.url}`, {
        method: ep.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer forged-invalid-token-xyz'
        },
        body: ep.body ? JSON.stringify(ep.body) : undefined
      });

      if (resFakeToken.status === 401) {
        passed++;
        console.log(`✅ ${ep.method} ${ep.url} strictly rejected (HTTP 401 without token & with invalid token)`);
      } else {
        console.error(`❌ FAILED: ${ep.method} ${ep.url} accepted invalid token! Status: ${resFakeToken.status}`);
        failed++;
      }
    } else {
      console.error(`❌ FAILED: ${ep.method} ${ep.url} returned HTTP ${resNoAuth.status} instead of 401!`);
      failed++;
    }
  }

  console.log(`\n=================================================`);
  console.log(`Total Protected Endpoints Tested: ${protectedEndpoints.length}`);
  console.log(`Passed (Strictly Rejected with HTTP 401): ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`=================================================`);

  if (failed === 0) {
    console.log('🎉 ALL PROTECTED ADMINISTRATIVE ENDPOINTS STRICTLY REJECT UNAUTHORIZED REQUESTS!');
  } else {
    process.exit(1);
  }
}

testUnauthorizedRejection();
