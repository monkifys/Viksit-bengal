const baseUrl = 'http://localhost:3000';

async function verifyAllRoutes() {
  console.log(`Starting comprehensive HTTP route verification against ${baseUrl}...`);

  // 1. Authenticate to get a valid token for protected endpoints
  const loginRes = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;
  console.log(`Authenticated as admin. Token: ${token ? 'OK' : 'FAILED'}`);

  const publicRoutes = [
    '/',
    '/bn/',
    '/economy.html',
    '/bn/economy.html',
    '/society.html',
    '/bn/society.html',
    '/districts.html',
    '/bn/districts.html',
    '/projects.html',
    '/bn/projects.html',
    '/latest.html',
    '/bn/latest.html',
    '/methodology.html',
    '/bn/methodology.html',
    '/submit.html',
    '/bn/submit.html',
    '/faq.html',
    '/bn/faq.html',
    '/help.html',
    '/bn/help.html',
    '/admin.html',
    '/api/health',
    '/api/stats',
    '/api/meta',
    '/api/districts',
    '/api/indicators',
    '/api/projects',
    '/api/promises',
    '/api/updates'
  ];

  const protectedRoutes = [
    '/api/session',
    '/api/audit-logs',
    '/api/status-history',
    '/api/evidence/submissions',
    '/api/scraped-queue',
    '/api/settings',
    '/api/export/csv?type=promises',
    '/api/export/csv?type=indicators',
    '/api/export/csv?type=projects',
    '/api/export/csv?type=districts'
  ];

  let passed = 0;
  let failed = 0;

  console.log(`\nTesting ${publicRoutes.length} Public Routes...`);
  for (const route of publicRoutes) {
    try {
      const res = await fetch(`${baseUrl}${route}`);
      if (res.status === 200) {
        passed++;
      } else {
        console.error(`❌ FAILED: ${route} returned HTTP ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ ERROR: ${route} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\nTesting ${protectedRoutes.length} Protected Routes with Bearer Authorization...`);
  for (const route of protectedRoutes) {
    try {
      const res = await fetch(`${baseUrl}${route}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 200) {
        passed++;
      } else {
        console.error(`❌ FAILED: ${route} returned HTTP ${res.status}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ ERROR: ${route} - ${err.message}`);
      failed++;
    }
  }

  console.log(`\n=================================================`);
  console.log(`Total Routes Verified: ${publicRoutes.length + protectedRoutes.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`=================================================`);

  if (failed === 0) {
    console.log(`🎉 100% OF TESTED ROUTES RETURNED HTTP 200 OK!`);
  } else {
    process.exit(1);
  }
}

verifyAllRoutes();
