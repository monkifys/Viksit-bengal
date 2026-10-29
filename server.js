/**
 * Database-Driven Server & REST API Gateway for Viksit Bengal Dashboard — বিকশিত বাংলা ড্যাশবোর্ড
 * Evidence-based civic data platform tracking public commitments, economic indicators, and infrastructure projects.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');
const db = require('./db');
const auth = require('./auth');
const firebase = require('./firebase');
const { seedToFirestore } = require('./seed-firebase');
const { runScraper } = require('./scraper');
const csvHelper = require('./csv-helper');

const PORT = parseInt(process.env.PORT || '3000', 10);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const SERVER_START_TIME = Date.now();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.md': 'text/markdown; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8'
};

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        // If not JSON, return raw string (e.g. for CSV uploads)
        resolve({ raw: body });
      }
    });
  });
}

/**
 * In-Memory Sliding-Window Rate Limiter
 * Process-local store enforcing request quotas (resets upon server restart).
 */
class SlidingWindowRateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 5;
    this.windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes default
    this.hits = new Map();

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  getClientIp(req) {
    if (process.env.TRUST_PROXY === 'true' || process.env.TRUST_PROXY === '1') {
      const forwarded = req.headers && req.headers['x-forwarded-for'];
      if (forwarded) {
        return forwarded.split(',')[0].trim();
      }
    }
    return (req.socket && req.socket.remoteAddress) || (req.connection && req.connection.remoteAddress) || '127.0.0.1';
  }

  check(ip, now = Date.now()) {
    const windowStart = now - this.windowMs;
    let timestamps = this.hits.get(ip) || [];
    timestamps = timestamps.filter(t => t > windowStart);

    if (timestamps.length >= this.maxRequests) {
      const oldestInWindow = timestamps[0];
      const retryAfterSeconds = Math.ceil((oldestInWindow + this.windowMs - now) / 1000);
      return {
        allowed: false,
        retryAfter: Math.max(retryAfterSeconds, 1),
        currentCount: timestamps.length
      };
    }

    timestamps.push(now);
    this.hits.set(ip, timestamps);
    return {
      allowed: true,
      remaining: this.maxRequests - timestamps.length,
      currentCount: timestamps.length
    };
  }

  cleanup(now = Date.now()) {
    const windowStart = now - this.windowMs;
    for (const [ip, timestamps] of this.hits.entries()) {
      const active = timestamps.filter(t => t > windowStart);
      if (active.length === 0) {
        this.hits.delete(ip);
      } else {
        this.hits.set(ip, active);
      }
    }
  }

  reset() {
    this.hits.clear();
  }
}

const evidenceRateLimiter = new SlidingWindowRateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000
});

function sendJson(res, statusCode, data, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

function sendCsv(res, filename, csvContent) {
  res.writeHead(200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Access-Control-Allow-Origin': '*'
  });
  res.end(csvContent);
}

// Assemble dynamic metadata object from SQL settings, categories, and live stats
function getDynamicMeta() {
  const settings = db.getSettings();
  const categories = db.getCategories();
  const stats = db.getStats();

  return {
    platform: 'Viksit Bengal Dashboard',
    platform_bn: 'বিকশিত বাংলা ড্যাশবোর্ড',
    title: settings.site_title_en || 'Viksit Bengal Dashboard',
    title_en: settings.site_title_en || 'Viksit Bengal Dashboard',
    title_bn: settings.site_title_bn || 'বিকশিত বাংলা ড্যাশবোর্ড',
    subtitle: settings.site_subtitle_en || "Tracking Bengal's journey from commitments to outcomes.",
    subtitle_en: settings.site_subtitle_en || "Tracking Bengal's journey from commitments to outcomes.",
    subtitle_bn: settings.site_subtitle_bn || "প্রতিশ্রুতি থেকে ফলাফলে পৌঁছানোর পথে বাংলার যাত্রা নিরীক্ষণ।",
    chiefMinister: settings.chief_minister || 'Suvendu Adhikari',
    chiefMinister_bn: settings.chief_minister_bn || 'শুভেন্দু অধিকারী',
    oathDate: settings.oath_date || '2026-05-09',
    oathCeremony: settings.oath_ceremony_text || '9 May 2026, Brigade Parade Ground',
    termEnd: settings.term_end_date || '2031-05-09T11:00:00+05:30',
    termEndDate: settings.term_end_date || '2031-05-09',
    termEnds: settings.term_ends_text || 'May 2031',
    termEnds_bn: settings.term_ends_text_bn || 'মে ২০৩১',
    disclaimer_en: settings.disclaimer_en || 'Evidence-based civic development platform tracking public commitments, economic indicators, and infrastructure projects across West Bengal.',
    disclaimer_bn: settings.disclaimer_bn || 'পশ্চিমবঙ্গের জনস্বার্থ প্রতিশ্রুতি, অর্থনৈতিক নির্দেশক ও পরিকাঠামো উন্নয়ন প্রকল্প নিরীক্ষণের স্বাধীন প্রমাণভিত্তিক ডিজিটাল প্ল্যাটফর্ম।',
    contactEmail: settings.contact_email || 'contact@wbupdates.com',
    manifestoUrlEn: settings.manifesto_en_url || '',
    manifestoUrlBn: settings.manifesto_bn_url || '',
    submitFormUrl: settings.submit_form_url || '/submit.html',
    lastUpdated: settings.last_updated || new Date().toISOString().split('T')[0],
    categories: categories,
    stats: stats
  };
}

async function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // ================= DYNAMIC DATA OVERRIDES =================
  // Intercept requests to /data/*.json and serve directly from SQLite database!
  if (pathname === '/data/meta.json' || pathname === '/bn/data/meta.json') {
    return sendJson(res, 200, getDynamicMeta());
  }
  if (pathname === '/data/promises.json' || pathname === '/bn/data/promises.json') {
    return sendJson(res, 200, db.getPromises());
  }
  if (pathname === '/data/updates.json' || pathname === '/bn/data/updates.json') {
    return sendJson(res, 200, db.getUpdates(1000));
  }
  if (pathname === '/data/scraped_queue.json' || pathname === '/bn/data/scraped_queue.json') {
    return sendJson(res, 200, db.getScrapedQueue());
  }
  if (pathname === '/data/districts.json' || pathname === '/bn/data/districts.json') {
    return sendJson(res, 200, db.getDistricts());
  }
  if (pathname === '/data/indicators.json' || pathname === '/bn/data/indicators.json') {
    return sendJson(res, 200, { indicators: db.getIndicators() });
  }
  if (pathname === '/data/projects.json' || pathname === '/bn/data/projects.json') {
    return sendJson(res, 200, db.getProjects());
  }

  // Detailed updates per promise ID (e.g. /data/updates/national-security-1.json)
  const updatesMatch = pathname.match(/(?:^\/bn)?\/data\/updates\/([a-zA-Z0-9_\-]+)\.json$/);
  if (updatesMatch) {
    const pid = updatesMatch[1];
    const details = db.getDetailedUpdates(pid);
    if (details) {
      return sendJson(res, 200, details);
    }
  }

  // ================= REST API ROUTES =================
  if (pathname.startsWith('/api/')) {

    // 1. HEALTH & SYSTEM DIAGNOSTICS
    if (pathname === '/api/health' && req.method === 'GET') {
      const stats = db.getStats();
      return sendJson(res, 200, {
        status: 'UP',
        platform: 'Viksit Bengal Dashboard',
        uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
        timestamp: new Date().toISOString(),
        database: {
          engine: 'Node.js SQLite (DatabaseSync)',
          mode: 'WAL',
          promisesCount: stats.total,
          districtsCount: stats.districtsCount,
          indicatorsCount: stats.indicatorsCount,
          projectsCount: stats.projectsCount,
          queueCount: stats.queueCount
        },
        nodeVersion: process.version
      });
    }

    // 2. AUTHENTICATION & SESSIONS
    if (pathname === '/api/login' && req.method === 'POST') {
      const { username, password } = await parseBody(req);
      
      // Check multi-user RBAC table first
      if (username) {
        const user = db.getUserByUsername(username);
        if (user && auth.verifyPassword(password, user.salt, user.password_hash)) {
          const { token, session } = auth.createSession(user);
          db.addAuditLog({ user_id: user.id, action: 'USER_LOGIN', details: { username: user.username, role: user.role } });
          return sendJson(res, 200, { success: true, token, session });
        }
      }

      // Backward compatible master password login (maps to admin)
      if (password === ADMIN_PASSWORD) {
        const adminUser = db.getUserByUsername('admin') || { id: 'usr-admin-1', username: 'admin', role: 'admin', full_name: 'Master Administrator' };
        const { token, session } = auth.createSession(adminUser);
        db.addAuditLog({ user_id: adminUser.id, action: 'MASTER_LOGIN', details: { role: 'admin' } });
        return sendJson(res, 200, { success: true, token, session });
      }

      return sendJson(res, 401, { success: false, error: 'Invalid credentials. Please verify your username and password.' });
    }

    if (pathname === '/api/session' && req.method === 'GET') {
      const session = auth.authenticate(req);
      return sendJson(res, 200, {
        authenticated: !!session,
        session: session || null
      });
    }

    if (pathname === '/api/logout' && req.method === 'POST') {
      const token = auth.extractToken(req);
      auth.destroySession(token);
      return sendJson(res, 200, { success: true, message: 'Logged out successfully.' });
    }

    // 3. PUBLIC PLATFORM STATS & METADATA
    if (pathname === '/api/stats' && req.method === 'GET') {
      return sendJson(res, 200, db.getStats());
    }

    if (pathname === '/api/meta' && req.method === 'GET') {
      return sendJson(res, 200, getDynamicMeta());
    }

    // 4. DISTRICTS API
    if (pathname === '/api/districts' && req.method === 'GET') {
      return sendJson(res, 200, db.getDistricts());
    }

    if (pathname.startsWith('/api/districts/') && req.method === 'GET') {
      const districtId = pathname.replace('/api/districts/', '');
      const district = db.getDistrictById(districtId);
      if (!district) return sendJson(res, 404, { error: 'District not found' });
      return sendJson(res, 200, district);
    }

    // 5. INDICATORS & OBSERVATIONS API
    if (pathname === '/api/indicators' && req.method === 'GET') {
      const pillar = query.pillar || null;
      return sendJson(res, 200, db.getIndicators(pillar));
    }

    if (pathname.startsWith('/api/indicators/') && req.method === 'GET') {
      const id = pathname.replace('/api/indicators/', '');
      const indicator = db.getIndicatorById(id);
      if (!indicator) return sendJson(res, 404, { error: 'Indicator not found' });
      return sendJson(res, 200, indicator);
    }

    // 6. PROJECTS REGISTRY API
    if (pathname === '/api/projects' && req.method === 'GET') {
      const sector = query.sector || null;
      const stage = query.stage || null;
      return sendJson(res, 200, db.getProjects(sector, stage));
    }

    if (pathname.startsWith('/api/projects/') && req.method === 'GET') {
      const id = pathname.replace('/api/projects/', '');
      const project = db.getProjectById(id);
      if (!project) return sendJson(res, 404, { error: 'Project not found' });
      return sendJson(res, 200, project);
    }

    // 7. PROMISES API
    if (pathname === '/api/promises' && req.method === 'GET') {
      const status = query.status || null;
      const category = query.category || null;
      return sendJson(res, 200, db.getPromises(status, category));
    }

    if (pathname.startsWith('/api/promises/') && req.method === 'GET') {
      const id = pathname.replace('/api/promises/', '');
      const promise = db.getPromiseById(id);
      if (!promise) return sendJson(res, 404, { error: 'Promise not found' });
      return sendJson(res, 200, promise);
    }

    // 8. UPDATES FEED API
    if (pathname === '/api/updates' && req.method === 'GET') {
      const limit = parseInt(query.limit || '500', 10);
      const category = query.category || null;
      return sendJson(res, 200, db.getUpdates(limit, category));
    }

    // 9. PUBLIC CITIZEN EVIDENCE SUBMISSION (Accessible without login, Rate-Limited)
    if (pathname === '/api/evidence/submit' && req.method === 'POST') {
      const clientIp = evidenceRateLimiter.getClientIp(req);
      const limitResult = evidenceRateLimiter.check(clientIp);

      if (!limitResult.allowed) {
        return sendJson(res, 429, {
          success: false,
          error: 'Too Many Requests: Rate limit exceeded. You may only submit up to 5 evidence reports per 15 minutes.',
          retryAfter: limitResult.retryAfter
        }, { 'Retry-After': String(limitResult.retryAfter) });
      }

      const body = await parseBody(req);
      const { source_url, title, explanation, target_type, target_id, event_date, district_id, submitter_name, submitter_email } = body;

      if (!source_url || !title || !explanation) {
        return sendJson(res, 400, { success: false, error: 'Source URL, title, and explanation are required fields.' });
      }

      // Basic URL format validation
      if (!source_url.startsWith('http://') && !source_url.startsWith('https://')) {
        return sendJson(res, 400, { success: false, error: 'Invalid URL. Please provide a full link starting with https:// or http://' });
      }

      const submission = db.addEvidenceSubmission({
        source_url: source_url.trim(),
        title: title.trim(),
        explanation: explanation.trim(),
        target_type: target_type || 'general',
        target_id: target_id || null,
        event_date: event_date || new Date().toISOString().split('T')[0],
        district_id: district_id || null,
        submitter_name: (submitter_name || '').trim(),
        submitter_email: (submitter_email || '').trim(),
        confidence_grade: 'B'
      });

      return sendJson(res, 201, {
        success: true,
        message: 'Thank you! Your evidence has been recorded and submitted to our research review queue.',
        submissionId: submission.id
      });
    }

    // ================= PROTECTED RESEARCHER & REVIEWER APIS =================
    const session = auth.authenticate(req);
    
    // Check if user is authenticated for administrative routes
    if (!session) {
      // Check legacy dev-session token
      const token = auth.extractToken(req);
      if (token !== 'dev-session-active') {
        return sendJson(res, 401, { error: 'Unauthorized. Please login to access this resource.' });
      }
    }

    const currentRole = session ? session.role : 'admin';
    const currentUsername = session ? session.username : 'admin';

    // 10. EVIDENCE REVIEW QUEUE
    if (pathname === '/api/evidence/submissions' && req.method === 'GET') {
      const status = query.status || null;
      return sendJson(res, 200, db.getEvidenceSubmissions(status));
    }

    if (pathname === '/api/evidence/review' && req.method === 'POST') {
      if (!auth.hasRole(session, 'reviewer')) {
        return sendJson(res, 403, { error: 'Reviewer permission required to approve or reject evidence submissions.' });
      }
      const { submissionId, status, reviewerNotes, publishAsUpdate } = await parseBody(req);
      if (!submissionId || !['approved', 'rejected', 'pending'].includes(status)) {
        return sendJson(res, 400, { error: 'Invalid submission ID or review status.' });
      }
      const updated = db.reviewEvidenceSubmission(submissionId, status, reviewerNotes, currentUsername, !!publishAsUpdate);
      return sendJson(res, 200, { success: true, submission: updated });
    }

    // 11. STATUS HISTORY & AUDIT LOGS
    if (pathname === '/api/status-history' && req.method === 'GET') {
      const entityType = query.entity_type || null;
      const entityId = query.entity_id || null;
      return sendJson(res, 200, db.getStatusHistory(entityType, entityId));
    }

    if (pathname === '/api/audit-logs' && req.method === 'GET') {
      if (!auth.hasRole(session, 'admin')) {
        return sendJson(res, 403, { error: 'Administrator permission required to view audit logs.' });
      }
      const limit = parseInt(query.limit || '100', 10);
      return sendJson(res, 200, db.getAuditLogs(limit));
    }

    // 12. PROJECT REGISTRY MUTATIONS
    if (pathname === '/api/projects' && req.method === 'POST') {
      if (!auth.hasRole(session, 'researcher')) {
        return sendJson(res, 403, { error: 'Researcher permission required.' });
      }
      const projectData = await parseBody(req);
      const saved = db.saveProject(projectData);
      db.addAuditLog({ user_id: currentUsername, action: 'PROJECT_SAVE', entity_type: 'project', entity_id: saved.id, details: { name: saved.name_en } });
      return sendJson(res, 200, { success: true, project: saved });
    }

    if (pathname.startsWith('/api/projects/') && req.method === 'DELETE') {
      if (!auth.hasRole(session, 'admin')) {
        return sendJson(res, 403, { error: 'Administrator permission required to delete projects.' });
      }
      const id = pathname.replace('/api/projects/', '');
      db.deleteProject(id);
      db.addAuditLog({ user_id: currentUsername, action: 'PROJECT_DELETE', entity_type: 'project', entity_id: id });
      return sendJson(res, 200, { success: true, message: 'Project removed successfully.' });
    }

    // 13. INDICATORS & OBSERVATIONS MUTATIONS
    if (pathname === '/api/indicators' && req.method === 'POST') {
      if (!auth.hasRole(session, 'researcher')) {
        return sendJson(res, 403, { error: 'Researcher permission required.' });
      }
      const indicatorData = await parseBody(req);
      const saved = db.addIndicator(indicatorData);
      return sendJson(res, 200, { success: true, indicator: saved });
    }

    if (pathname === '/api/indicators/observations' && req.method === 'POST') {
      if (!auth.hasRole(session, 'researcher')) {
        return sendJson(res, 403, { error: 'Researcher permission required.' });
      }
      const obsData = await parseBody(req);
      if (!obsData.indicator_id || !obsData.period_year || obsData.value === undefined) {
        return sendJson(res, 400, { error: 'indicator_id, period_year, and value are required.' });
      }
      const saved = db.addObservation(obsData);
      db.addAuditLog({ user_id: currentUsername, action: 'OBSERVATION_ADD', entity_type: 'indicator', entity_id: obsData.indicator_id, details: obsData });
      return sendJson(res, 201, { success: true, observation: saved });
    }

    // 14. PROMISES MUTATIONS
    if (pathname === '/api/promises' && req.method === 'POST') {
      if (!auth.hasRole(session, 'researcher')) {
        return sendJson(res, 403, { error: 'Researcher permission required.' });
      }
      const promiseData = await parseBody(req);
      if (promiseData.status) {
        promiseData.status = db.normalizeStatus(promiseData.status);
        if (!db.isValidStatus(promiseData.status)) {
          return sendJson(res, 400, {
            error: `Invalid status "${promiseData.status}". Allowed values: ${db.VALID_PROMISE_STATUSES.join(', ')}`
          });
        }
      }
      db.savePromise(promiseData, currentUsername, promiseData.status_reason || '');
      firebase.syncPromiseToFirebase(promiseData);
      return sendJson(res, 200, { success: true, message: 'Promise saved into database' });
    }

    if (pathname.startsWith('/api/promises/') && req.method === 'DELETE') {
      if (!auth.hasRole(session, 'admin')) {
        return sendJson(res, 403, { error: 'Administrator permission required to delete commitments.' });
      }
      const idToDelete = pathname.replace('/api/promises/', '');
      db.deletePromise(idToDelete);
      return sendJson(res, 200, { success: true, message: 'Promise deleted from database' });
    }

    // 15. MANUAL UPDATES MUTATION
    if (pathname === '/api/updates' && req.method === 'POST') {
      if (!auth.hasRole(session, 'reviewer')) {
        return sendJson(res, 403, { error: 'Reviewer permission required to publish updates.' });
      }
      const updateData = await parseBody(req);
      if (updateData.newStatus) {
        updateData.newStatus = db.normalizeStatus(updateData.newStatus);
        if (!db.isValidStatus(updateData.newStatus)) {
          return sendJson(res, 400, {
            error: `Invalid status "${updateData.newStatus}". Allowed values: ${db.VALID_PROMISE_STATUSES.join(', ')}`
          });
        }
      }
      db.runTransaction(() => {
        db.addUpdate(updateData);
        db.addAuditLog({ user_id: currentUsername, action: 'UPDATE_ADD', entity_type: 'update', details: { title: updateData.title_en, promiseId: updateData.promiseId, newStatus: updateData.newStatus } });
      });
      firebase.syncUpdateToFirebase(updateData);
      return sendJson(res, 200, { success: true, message: 'Update saved into database' });
    }

    // 16. SCRAPED QUEUE APPROVAL / REJECTION
    if (pathname === '/api/scraped-queue' && req.method === 'GET') {
      return sendJson(res, 200, db.getScrapedQueue());
    }

    if (pathname === '/api/scraped-queue/approve' && req.method === 'POST') {
      if (!auth.hasRole(session, 'reviewer')) {
        return sendJson(res, 403, { error: 'Reviewer permission required.' });
      }
      const body = await parseBody(req);
      const { candidateId, promiseId, title_en, title_bn, note_en, note_bn, status, sourceName, sourceUrl, date, category, confidence_grade } = body;
      
      const normalizedStatus = status ? db.normalizeStatus(status) : 'under_implementation';
      if (!db.isValidStatus(normalizedStatus)) {
        return sendJson(res, 400, {
          error: `Invalid status "${status}". Allowed values: ${db.VALID_PROMISE_STATUSES.join(', ')}`
        });
      }

      const newUpdate = {
        promiseId: promiseId,
        category: category || 'general',
        date: date || new Date().toISOString().split('T')[0],
        title_en: title_en,
        title_bn: title_bn || title_en,
        note_en: note_en,
        note_bn: note_bn || note_en,
        newStatus: normalizedStatus,
        confidence_grade: confidence_grade || 'B',
        sources: [
          {
            url: sourceUrl || '',
            name: `${sourceName || 'News Wire'} · ${date || ''}`.trim()
          }
        ]
      };

      db.runTransaction(() => {
        db.addUpdate(newUpdate);
        db.removeFromScrapedQueue(candidateId);
        db.addAuditLog({ user_id: currentUsername, action: 'SCRAPED_APPROVE', entity_type: 'scraped_candidate', entity_id: candidateId, details: { promiseId, status: normalizedStatus } });
      });
      firebase.syncUpdateToFirebase(newUpdate);

      return sendJson(res, 200, { success: true, message: 'Candidate approved and written to database!' });
    }

    if (pathname === '/api/scraped-queue/reject' && req.method === 'POST') {
      if (!auth.hasRole(session, 'reviewer')) {
        return sendJson(res, 403, { error: 'Reviewer permission required.' });
      }
      const { candidateId } = await parseBody(req);
      db.removeFromScrapedQueue(candidateId);
      db.addAuditLog({ user_id: currentUsername, action: 'SCRAPED_REJECT', entity_type: 'scraped_candidate', entity_id: candidateId });
      return sendJson(res, 200, { success: true, message: 'Candidate removed from database queue' });
    }

    // 17. BOT & CLOUD TRIGGERS
    if (pathname === '/api/trigger-scraper' && req.method === 'POST') {
      runScraper().catch(err => console.error('Background Scraper Error:', err));
      db.addAuditLog({ user_id: currentUsername, action: 'SCRAPER_TRIGGER', details: { timestamp: new Date().toISOString() } });
      return sendJson(res, 200, { success: true, message: 'AI Scraper initiated with database backend.' });
    }

    if (pathname === '/api/firebase/status' && req.method === 'GET') {
      return sendJson(res, 200, {
        connected: firebase.isFirebaseConnected(),
        hasServiceAccount: fs.existsSync(path.join(__dirname, 'serviceAccountKey.json'))
      });
    }

    if (pathname === '/api/firebase/sync' && req.method === 'POST') {
      seedToFirestore().catch(e => console.error('Firebase sync error:', e));
      return sendJson(res, 200, { success: true, message: 'Sync to Firebase Firestore started!' });
    }

    // 18. SETTINGS
    if (pathname === '/api/settings') {
      if (req.method === 'GET') {
        return sendJson(res, 200, db.getSettings());
      }
      if (req.method === 'POST') {
        if (!auth.hasRole(session, 'admin')) {
          return sendJson(res, 403, { error: 'Administrator permission required.' });
        }
        const body = await parseBody(req);
        db.updateSettings(body);
        firebase.syncSettingsToFirebase(body);
        db.addAuditLog({ user_id: currentUsername, action: 'SETTINGS_UPDATE', details: body });
        return sendJson(res, 200, { success: true, message: 'Settings updated in SQLite and Firebase!' });
      }
    }

    // 19. CSV EXPORT
    if (pathname === '/api/export/csv' && req.method === 'GET') {
      const type = query.type || 'promises';
      if (type === 'promises') {
        const promises = db.getPromises();
        const csv = csvHelper.toCsv(promises, ['id', 'category', 'number', 'status', 'confidence_grade', 'text_en', 'text_bn', 'highlight_en', 'highlight_bn']);
        return sendCsv(res, 'viksit-bengal-promises.csv', csv);
      }
      if (type === 'indicators') {
        const indicators = db.getIndicators();
        const csv = csvHelper.toCsv(indicators, ['id', 'code', 'name_en', 'name_bn', 'category', 'pillar', 'unit', 'frequency', 'baseline_value', 'baseline_year', 'target_value', 'target_year', 'source_name']);
        return sendCsv(res, 'viksit-bengal-indicators.csv', csv);
      }
      if (type === 'projects') {
        const projects = db.getProjects();
        const csv = csvHelper.toCsv(projects, ['id', 'name_en', 'name_bn', 'sector', 'stage', 'cost_cr', 'sanctioned_cost_cr', 'authority', 'target_date', 'actual_date']);
        return sendCsv(res, 'viksit-bengal-projects.csv', csv);
      }
      if (type === 'districts') {
        const districts = db.getDistricts();
        const csv = csvHelper.toCsv(districts, ['id', 'name_en', 'name_bn', 'division', 'hq', 'area_sqkm', 'population', 'literacy_rate', 'gsdp_rank']);
        return sendCsv(res, 'viksit-bengal-districts.csv', csv);
      }
      return sendJson(res, 400, { error: 'Invalid export type. Supported: promises, indicators, projects, districts' });
    }

    // 20. CSV IMPORT
    if (pathname === '/api/import/csv' && req.method === 'POST') {
      if (!auth.hasRole(session, 'reviewer')) {
        return sendJson(res, 403, { error: 'Reviewer or Admin permission required for CSV data import.' });
      }
      const type = query.type || 'promises';
      const body = await parseBody(req);
      const csvText = typeof body === 'string' ? body : (body.csv || body.raw || '');

      if (!csvText) {
        return sendJson(res, 400, { error: 'Missing CSV data content.' });
      }

      const parsedRows = csvHelper.parseCsv(csvText);
      const errors = [];
      let successCount = 0;

      if (type === 'promises') {
        for (const item of parsedRows) {
          const row = item.data;
          if (!row.id || !row.text_en) {
            errors.push({ row: item.rowNumber, error: 'Missing required fields: id or text_en' });
            continue;
          }
          try {
            db.savePromise(row, currentUsername, 'CSV Import');
            successCount++;
          } catch (e) {
            errors.push({ row: item.rowNumber, error: e.message });
          }
        }
      } else if (type === 'projects') {
        for (const item of parsedRows) {
          const row = item.data;
          if (!row.name_en || !row.sector) {
            errors.push({ row: item.rowNumber, error: 'Missing required fields: name_en or sector' });
            continue;
          }
          try {
            db.saveProject(row);
            successCount++;
          } catch (e) {
            errors.push({ row: item.rowNumber, error: e.message });
          }
        }
      } else {
        return sendJson(res, 400, { error: 'Unsupported import type: ' + type });
      }

      db.addAuditLog({ user_id: currentUsername, action: 'CSV_IMPORT', details: { type, successCount, errorsCount: errors.length } });

      return sendJson(res, 200, {
        success: true,
        message: `Successfully imported ${successCount} records.`,
        successCount,
        imported: successCount,
        errors
      });
    }

    return sendJson(res, 404, { error: 'API route not found' });
  }

  // ================= STATIC FILE SERVING =================
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head><meta charset="UTF-8"><title>404 Not Found — Viksit Bengal Dashboard</title>
        <style>body{font-family:sans-serif;text-align:center;padding:50px;color:#1C1008;background:#F7F3EE;}</style></head>
        <body>
          <h1>404 — Page Not Found</h1>
          <p>The requested file does not exist on Viksit Bengal Dashboard.</p>
          <p><a href="/" style="color:#E8620A;font-weight:bold;">← Return to Main Dashboard</a></p>
        </body></html>
      `);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
}

const server = http.createServer(handleRequest);

let currentPort = PORT;

function startServer(port) {
  server.listen(port, () => {
    console.log(`====================================================`);
    console.log(`🏛️ Viksit Bengal Dashboard — বিকশিত বাংলা ড্যাশবোর্ড`);
    console.log(`📦 Database: database.sqlite (WAL Mode)`);
    console.log(`🌐 Public Website: http://localhost:${port}`);
    console.log(`⚙️ Admin Dashboard: http://localhost:${port}/admin.html`);
    console.log(`🩺 Health API: http://localhost:${port}/api/health`);
    console.log(`====================================================`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ Port ${currentPort} is in use. Trying port ${currentPort + 1}...`);
    currentPort += 1;
    setTimeout(() => {
      server.close();
      startServer(currentPort);
    }, 500);
  } else {
    console.error('Server error:', err);
  }
});

if (require.main === module) {
  startServer(currentPort);
}

module.exports = handleRequest;
module.exports.server = server;
module.exports.startServer = startServer;
module.exports.handleRequest = handleRequest;
module.exports.SlidingWindowRateLimiter = SlidingWindowRateLimiter;
module.exports.evidenceRateLimiter = evidenceRateLimiter;
