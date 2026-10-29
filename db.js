/**
 * SQLite Database Engine for Viksit Bengal Dashboard — বিকশিত বাংলা ড্যাশবোর্ড
 * Complete ACID-compliant relational SQL database with RBAC, indicators, districts, and project registry.
 */

const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const auth = require('./auth');

let DB_PATH = path.join(__dirname, 'database.sqlite');

// On Vercel Serverless environment, /var/task is read-only.
// Copy database to /tmp if running on Vercel to allow WAL journaling and writes.
if (process.env.VERCEL) {
  const tmpDbPath = path.join('/tmp', 'database.sqlite');
  if (!fs.existsSync(tmpDbPath)) {
    try {
      fs.copyFileSync(DB_PATH, tmpDbPath);
    } catch (err) {
      console.error('Failed to copy database to /tmp:', err);
    }
  }
  DB_PATH = tmpDbPath;
}

const db = new DatabaseSync(DB_PATH);

// Enable WAL mode & foreign keys
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 5000;');

// --- STANDARDIZED 11-STAGE CIVIC STATUS MODEL ---
const VALID_PROMISE_STATUSES = [
  'not_started',
  'announced',
  'legally_initiated',
  'funded',
  'under_implementation',
  'partially_delivered',
  'delivered',
  'delayed',
  'reversed',
  'disputed',
  'not_verifiable'
];

const LEGACY_STATUS_MAP = {
  'pending': 'not_started',
  'inprogress': 'under_implementation',
  'done': 'delivered',
  'evaded': 'not_verifiable'
};

function normalizeStatus(status) {
  if (!status) return 'not_started';
  return LEGACY_STATUS_MAP[status] || status;
}

function isValidStatus(status) {
  return VALID_PROMISE_STATUSES.includes(status);
}

// Initialize Tables
function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      icon TEXT,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS promises (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      number INTEGER DEFAULT 0,
      text_en TEXT NOT NULL,
      text_bn TEXT,
      highlight_en TEXT,
      highlight_bn TEXT,
      status TEXT DEFAULT 'pending',
      key_promise INTEGER,
      keywords_json TEXT,
      update_count INTEGER DEFAULT 0,
      latest_update_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_promises_category ON promises(category);
    CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
    CREATE INDEX IF NOT EXISTS idx_promises_key ON promises(key_promise);

    CREATE TABLE IF NOT EXISTS updates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      promise_id TEXT,
      category TEXT,
      date TEXT NOT NULL,
      title_en TEXT NOT NULL,
      title_bn TEXT,
      note_en TEXT,
      note_bn TEXT,
      sources_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_updates_promise ON updates(promise_id);
    CREATE INDEX IF NOT EXISTS idx_updates_date ON updates(date);

    CREATE TABLE IF NOT EXISTS initiatives (
      id TEXT PRIMARY KEY,
      category TEXT,
      title_en TEXT NOT NULL,
      title_bn TEXT,
      desc_en TEXT,
      desc_bn TEXT,
      status TEXT DEFAULT 'inprogress',
      date TEXT,
      sources_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS scraped_queue (
      id TEXT PRIMARY KEY,
      scraped_at TEXT,
      source_name TEXT,
      source_url TEXT,
      pub_date TEXT,
      news_title TEXT NOT NULL,
      news_snippet TEXT,
      matched_promise_id TEXT,
      matched_promise_text TEXT,
      matched_category TEXT,
      confidence_score INTEGER DEFAULT 0,
      suggested_status TEXT DEFAULT 'inprogress',
      proposed_title_en TEXT,
      proposed_title_bn TEXT,
      proposed_note_en TEXT,
      proposed_note_bn TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS promise_detailed_updates (
      promise_id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- NEW RELATIONAL ENTITIES FOR VIKSIT BENGAL CIVIC PLATFORM

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'researcher',
      full_name TEXT,
      email TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS districts (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      division TEXT,
      hq TEXT,
      area_sqkm REAL,
      population INTEGER,
      literacy_rate REAL,
      gsdp_rank INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS indicators (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      category TEXT NOT NULL,
      pillar TEXT NOT NULL, -- 'economy' | 'society'
      unit TEXT NOT NULL,
      frequency TEXT DEFAULT 'annual',
      baseline_value REAL,
      baseline_year TEXT,
      target_value REAL,
      target_year TEXT,
      source_name TEXT,
      source_url TEXT,
      description_en TEXT,
      description_bn TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_indicators_pillar ON indicators(pillar);
    CREATE INDEX IF NOT EXISTS idx_indicators_category ON indicators(category);

    CREATE TABLE IF NOT EXISTS indicator_observations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      indicator_id TEXT NOT NULL,
      district_id TEXT,
      period_year TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT,
      status TEXT DEFAULT 'actual', -- 'actual' | 'provisional' | 'budget_estimate'
      confidence_grade TEXT DEFAULT 'A', -- 'A' | 'B' | 'C' | 'D'
      source_name TEXT,
      source_url TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (indicator_id) REFERENCES indicators(id) ON DELETE CASCADE,
      FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_obs_indicator ON indicator_observations(indicator_id);
    CREATE INDEX IF NOT EXISTS idx_obs_district ON indicator_observations(district_id);

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_bn TEXT NOT NULL,
      sector TEXT NOT NULL, -- 'transport' | 'metro' | 'port' | 'energy' | 'water' | 'urban' | 'industrial'
      district_id TEXT,
      authority TEXT,
      cost_cr REAL,
      sanctioned_cost_cr REAL,
      stage TEXT NOT NULL DEFAULT 'under_construction', -- 'proposed' | 'announced' | 'sanctioned' | 'funded' | 'under_construction' | 'completed' | 'delayed' | 'cancelled'
      target_date TEXT,
      actual_date TEXT,
      source_url TEXT,
      description_en TEXT,
      description_bn TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_projects_sector ON projects(sector);
    CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
    CREATE INDEX IF NOT EXISTS idx_projects_district ON projects(district_id);

    CREATE TABLE IF NOT EXISTS project_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id TEXT NOT NULL,
      title_en TEXT NOT NULL,
      title_bn TEXT,
      target_date TEXT,
      status TEXT DEFAULT 'pending', -- 'completed' | 'in_progress' | 'delayed' | 'pending'
      completion_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);

    CREATE TABLE IF NOT EXISTS evidence_submissions (
      id TEXT PRIMARY KEY,
      target_type TEXT NOT NULL, -- 'promise' | 'project' | 'indicator' | 'general'
      target_id TEXT,
      source_url TEXT NOT NULL,
      title TEXT NOT NULL,
      event_date TEXT,
      district_id TEXT,
      submitter_name TEXT,
      submitter_email TEXT,
      explanation TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
      confidence_grade TEXT DEFAULT 'B', -- 'A' | 'B' | 'C' | 'D'
      reviewer_notes TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_evidence_status ON evidence_submissions(status);
    CREATE INDEX IF NOT EXISTS idx_evidence_target ON evidence_submissions(target_id);

    CREATE TABLE IF NOT EXISTS status_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL, -- 'promise' | 'project' | 'indicator'
      entity_id TEXT NOT NULL,
      previous_status TEXT,
      new_status TEXT NOT NULL,
      reason TEXT,
      reviewer_name TEXT,
      evidence_url TEXT,
      confidence_grade TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_status_history_entity ON status_history(entity_type, entity_id);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details_json TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
  `);

  // Safe migrations for new columns on existing tables
  safeAddColumn('promises', 'confidence_grade', "TEXT DEFAULT 'B'");
  safeAddColumn('promises', 'district_id', 'TEXT');
  safeAddColumn('promises', 'department', 'TEXT');
  safeAddColumn('updates', 'confidence_grade', "TEXT DEFAULT 'B'");
  safeAddColumn('updates', 'district_id', 'TEXT');
  safeAddColumn('updates', 'event_date', 'TEXT');
}

function safeAddColumn(table, column, colDef) {
  try {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${colDef};`);
  } catch (err) {
    // Column already exists, safe to ignore
  }
}

// Safe, repeatable database migration for 11-stage civic statuses
function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS legacy_status_migrations (
      promise_id TEXT PRIMARY KEY,
      legacy_status TEXT NOT NULL,
      migrated_status TEXT NOT NULL,
      migrated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      review_flag INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const initialCheck = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('migrate_legacy_promise_statuses_v1');
  if (initialCheck) return;

  try {
    db.exec('BEGIN IMMEDIATE');
    const checkInside = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('migrate_legacy_promise_statuses_v1');
    if (checkInside) {
      db.exec('COMMIT');
      return;
    }

    const legacyRows = db.prepare("SELECT id, status FROM promises WHERE status IN ('pending', 'inprogress', 'done', 'evaded')").all();
    if (legacyRows.length > 0) {
      console.log(`[DB Migration] Migrating ${legacyRows.length} legacy promise statuses to 11-stage standardized statuses...`);
      const ins = db.prepare('INSERT OR REPLACE INTO legacy_status_migrations (promise_id, legacy_status, migrated_status, review_flag) VALUES (?, ?, ?, ?)');
      for (const r of legacyRows) {
        const newStatus = normalizeStatus(r.status);
        const flag = r.status === 'evaded' ? 1 : 0;
        ins.run(r.id, r.status, newStatus, flag);
      }

      db.exec(`
        UPDATE promises SET status = 'not_started' WHERE status = 'pending';
        UPDATE promises SET status = 'under_implementation' WHERE status = 'inprogress';
        UPDATE promises SET status = 'delivered' WHERE status = 'done';
        UPDATE promises SET status = 'not_verifiable' WHERE status = 'evaded';
      `);

      // Insert audit log entry
      db.prepare(`
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
        VALUES ('system', 'LEGACY_STATUS_MIGRATION', 'promises', 'all', ?)
      `).run(JSON.stringify({
        migratedCount: legacyRows.length,
        mapping: LEGACY_STATUS_MAP,
        timestamp: new Date().toISOString()
      }));
    }

    db.prepare('INSERT OR IGNORE INTO schema_migrations (version) VALUES (?)').run('migrate_legacy_promise_statuses_v1');
    db.exec('COMMIT');
    console.log('✅ Legacy status migration applied successfully in SQLite.');
  } catch (err) {
    try { db.exec('ROLLBACK'); } catch (e) {}
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      return;
    }
    console.error('❌ Legacy status migration failed and rolled back:', err);
    throw err;
  }
}

// Seed all tables from source JSON files
function seedDatabase() {
  // 1. Seed Site Settings
  const checkSetting = db.prepare('SELECT COUNT(*) as count FROM site_settings').get();
  if (checkSetting.count === 0) {
    const metaPath = path.join(__dirname, 'data', 'meta.json');
    let meta = {};
    if (fs.existsSync(metaPath)) {
      try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')); } catch (e) {}
    }

    const defaultSettings = {
      site_title_en: 'Viksit Bengal Dashboard',
      site_title_bn: 'বিকশিত বাংলা ড্যাশবোর্ড',
      site_subtitle_en: "Tracking Bengal's journey from commitments to outcomes.",
      site_subtitle_bn: "প্রতিশ্রুতি থেকে ফলাফলে পৌঁছানোর পথে বাংলার যাত্রা নিরীক্ষণ।",
      chief_minister: 'Suvendu Adhikari',
      chief_minister_bn: 'শুভেন্দু অধিকারী',
      oath_date: '2026-05-09',
      oath_ceremony_text: '9 May 2026, Brigade Parade Ground',
      oath_ceremony_text_bn: '৯ মে ২০২৬, ব্রিগেড প্যারেড গ্রাউন্ড',
      term_end_date: '2031-05-09',
      term_ends_text: 'May 2031',
      term_ends_text_bn: 'মে ২০৩১',
      disclaimer_en: 'Evidence-based civic development platform tracking public commitments, economic indicators, and infrastructure projects across West Bengal.',
      disclaimer_bn: 'পশ্চিমবঙ্গের জনস্বার্থ প্রতিশ্রুতি, অর্থনৈতিক নির্দেশক ও পরিকাঠামো উন্নয়ন প্রকল্প নিরীক্ষণের স্বাধীন প্রমাণভিত্তিক ডিজিটাল প্ল্যাটফর্ম।',
      contact_email: 'contact@wbupdates.com',
      manifesto_en_url: 'https://www.bjp.org/files/election-manifesto-documents/Bhoroshar-Shopoth-EN-WB.pdf',
      manifesto_bn_url: 'https://www.bjp.org/files/inline-documents/Bhorosha-Shopath-Bangla.pdf',
      submit_form_url: '/submit.html',
      last_updated: meta.lastUpdated || new Date().toISOString().split('T')[0]
    };

    const insertSetting = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(defaultSettings)) {
      insertSetting.run(k, String(v));
    }
  }

  // 2. Seed Users
  const checkUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (checkUsers.count === 0) {
    console.log('👤 Seeding initial RBAC users...');
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, password_hash, salt, role, full_name, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const usersToSeed = [
      { id: 'usr-admin-1', username: 'admin', pass: 'admin123', role: 'admin', name: 'Master Administrator', email: 'admin@wbupdates.com' },
      { id: 'usr-reviewer-1', username: 'reviewer1', pass: 'reviewer123', role: 'reviewer', name: 'Senior Data Reviewer', email: 'reviewer@wbupdates.com' },
      { id: 'usr-researcher-1', username: 'researcher1', pass: 'researcher123', role: 'researcher', name: 'Field Researcher', email: 'researcher@wbupdates.com' }
    ];

    for (const u of usersToSeed) {
      const salt = auth.generateSalt();
      const hash = auth.hashPassword(u.pass, salt);
      insertUser.run(u.id, u.username, hash, salt, u.role, u.name, u.email);
    }
  }

  // 3. Seed Districts (23 districts)
  const checkDistricts = db.prepare('SELECT COUNT(*) as count FROM districts').get();
  if (checkDistricts.count === 0) {
    const districtsPath = path.join(__dirname, 'data', 'districts.json');
    if (fs.existsSync(districtsPath)) {
      try {
        const districts = JSON.parse(fs.readFileSync(districtsPath, 'utf-8'));
        const insertDist = db.prepare(`
          INSERT INTO districts (id, name_en, name_bn, division, hq, area_sqkm, population, literacy_rate, gsdp_rank)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const d of districts) {
          insertDist.run(d.id, d.name_en, d.name_bn, d.division || '', d.hq || '', d.area_sqkm || 0, d.population || 0, d.literacy_rate || 0, d.gsdp_rank || 0);
        }
        console.log(`✅ Seeded ${districts.length} West Bengal districts into SQLite.`);
      } catch (e) {
        console.error('Error seeding districts:', e);
      }
    }
  }

  // 4. Seed Indicators & Observations
  const checkIndicators = db.prepare('SELECT COUNT(*) as count FROM indicators').get();
  if (checkIndicators.count === 0) {
    const indicatorsPath = path.join(__dirname, 'data', 'indicators.json');
    if (fs.existsSync(indicatorsPath)) {
      try {
        const data = JSON.parse(fs.readFileSync(indicatorsPath, 'utf-8'));
        const insertInd = db.prepare(`
          INSERT INTO indicators (id, code, name_en, name_bn, category, pillar, unit, frequency, baseline_value, baseline_year, target_value, target_year, source_name, source_url, description_en, description_bn)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertObs = db.prepare(`
          INSERT INTO indicator_observations (indicator_id, district_id, period_year, value, unit, status, confidence_grade, source_name, source_url)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const ind of (data.indicators || [])) {
          insertInd.run(
            ind.id,
            ind.code,
            ind.name_en,
            ind.name_bn,
            ind.category,
            ind.pillar,
            ind.unit,
            ind.frequency || 'annual',
            ind.baseline_value || null,
            ind.baseline_year || null,
            ind.target_value || null,
            ind.target_year || null,
            ind.source_name || '',
            ind.source_url || '',
            ind.description_en || '',
            ind.description_bn || ''
          );

          if (Array.isArray(ind.observations)) {
            for (const obs of ind.observations) {
              insertObs.run(
                ind.id,
                obs.district_id || null,
                obs.period_year,
                obs.value,
                ind.unit,
                obs.status || 'actual',
                obs.confidence_grade || 'A',
                ind.source_name || '',
                ind.source_url || ''
              );
            }
          }
        }
        console.log(`✅ Seeded ${data.indicators.length} indicators with observations into SQLite.`);
      } catch (e) {
        console.error('Error seeding indicators:', e);
      }
    }
  }

  // 5. Seed Projects & Milestones
  const checkProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (checkProjects.count === 0) {
    const projectsPath = path.join(__dirname, 'data', 'projects.json');
    if (fs.existsSync(projectsPath)) {
      try {
        const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf-8'));
        const insertProj = db.prepare(`
          INSERT INTO projects (id, name_en, name_bn, sector, district_id, authority, cost_cr, sanctioned_cost_cr, stage, target_date, actual_date, source_url, description_en, description_bn)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const insertMs = db.prepare(`
          INSERT INTO project_milestones (project_id, title_en, title_bn, target_date, status)
          VALUES (?, ?, ?, ?, ?)
        `);

        for (const p of projects) {
          insertProj.run(
            p.id,
            p.name_en,
            p.name_bn,
            p.sector,
            p.district_id || null,
            p.authority || '',
            p.cost_cr || null,
            p.sanctioned_cost_cr || null,
            p.stage || 'under_construction',
            p.target_date || null,
            p.actual_date || null,
            p.source_url || '',
            p.description_en || '',
            p.description_bn || ''
          );

          if (Array.isArray(p.milestones)) {
            for (const m of p.milestones) {
              insertMs.run(p.id, m.title_en, m.title_bn || '', m.target_date || '', m.status || 'pending');
            }
          }
        }
        console.log(`✅ Seeded ${projects.length} infrastructure projects into SQLite.`);
      } catch (e) {
        console.error('Error seeding projects:', e);
      }
    }
  }

  // 6. Seed Categories
  const checkCats = db.prepare('SELECT COUNT(*) as count FROM categories').get();
  if (checkCats.count === 0) {
    const metaPath = path.join(__dirname, 'data', 'meta.json');
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        if (Array.isArray(meta.categories)) {
          const insertCat = db.prepare('INSERT OR REPLACE INTO categories (id, name_en, name_bn, icon, sort_order) VALUES (?, ?, ?, ?, ?)');
          meta.categories.forEach((cat, idx) => {
            insertCat.run(cat.id, cat.name_en || cat.id, cat.name_bn || cat.name_en || cat.id, cat.icon || '', idx);
          });
        }
      } catch (e) {}
    }
  }

  // 7. Seed Promises
  const checkPromises = db.prepare('SELECT COUNT(*) as count FROM promises').get();
  if (checkPromises.count === 0) {
    const promisesPath = path.join(__dirname, 'data', 'promises.json');
    if (fs.existsSync(promisesPath)) {
      try {
        const promises = JSON.parse(fs.readFileSync(promisesPath, 'utf-8'));
        const insertPromise = db.prepare(`
          INSERT INTO promises (id, category, number, text_en, text_bn, highlight_en, highlight_bn, status, key_promise, keywords_json, update_count, latest_update_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const p of promises) {
          insertPromise.run(
            p.id,
            p.category || 'general',
            p.number || 0,
            p.text_en || '',
            p.text_bn || '',
            p.highlight_en || '',
            p.highlight_bn || '',
            p.status || 'pending',
            p.keyPromise || null,
            JSON.stringify(p.keywords || []),
            p.updateCount || 0,
            p.latestUpdate ? JSON.stringify(p.latestUpdate) : null
          );
        }
        console.log(`✅ Seeded ${promises.length} promises into SQLite.`);
      } catch (e) {
        console.error('Error seeding promises:', e);
      }
    }
  }

  // 8. Seed Updates
  const checkUpdates = db.prepare('SELECT COUNT(*) as count FROM updates').get();
  if (checkUpdates.count === 0) {
    const updatesPath = path.join(__dirname, 'data', 'updates.json');
    if (fs.existsSync(updatesPath)) {
      try {
        const updates = JSON.parse(fs.readFileSync(updatesPath, 'utf-8'));
        const insertUpdate = db.prepare(`
          INSERT INTO updates (promise_id, category, date, title_en, title_bn, note_en, note_bn, sources_json)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        for (const u of updates) {
          insertUpdate.run(
            u.promiseId || '',
            u.category || '',
            u.date || '',
            u.title_en || '',
            u.title_bn || '',
            u.note_en || '',
            u.note_bn || '',
            JSON.stringify(u.sources || [])
          );
        }
        console.log(`✅ Seeded ${updates.length} updates into SQLite.`);
      } catch (e) {
        console.error('Error seeding updates:', e);
      }
    }
  }
}

initSchema();
seedDatabase();
runMigrations();

// --- DATA ACCESS METHODS ---

module.exports = {
  db,
  VALID_PROMISE_STATUSES,
  LEGACY_STATUS_MAP,
  normalizeStatus,
  isValidStatus,

  // --- TRANSACTION SUPPORT ---
  runTransaction(fn) {
    db.exec('BEGIN IMMEDIATE');
    try {
      const result = fn();
      db.exec('COMMIT');
      return result;
    } catch (err) {
      try {
        db.exec('ROLLBACK');
      } catch (rollbackErr) {
        console.error('[DB] Rollback failed:', rollbackErr);
      }
      throw err;
    }
  },

  // --- USER & RBAC METHODS ---
  getUserByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  getUserById(id) {
    const r = db.prepare('SELECT id, username, role, full_name, email, created_at FROM users WHERE id = ?').get(id);
    return r || null;
  },

  getUsers() {
    return db.prepare('SELECT id, username, role, full_name, email, created_at FROM users ORDER BY created_at ASC').all();
  },

  createUser(u) {
    const salt = auth.generateSalt();
    const hash = auth.hashPassword(u.password, salt);
    const id = u.id || 'usr_' + Date.now();
    db.prepare(`
      INSERT INTO users (id, username, password_hash, salt, role, full_name, email)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, u.username, hash, salt, u.role || 'researcher', u.fullName || u.username, u.email || '');
    return { id, username: u.username, role: u.role || 'researcher' };
  },

  // --- SETTINGS ---
  getSettings() {
    const rows = db.prepare('SELECT key, value FROM site_settings').all();
    const settings = {};
    for (const r of rows) settings[r.key] = r.value;
    return settings;
  },

  updateSetting(key, value) {
    db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)').run(key, String(value));
  },

  updateSettings(obj) {
    const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(obj)) {
      stmt.run(k, String(v));
    }
  },

  // --- CATEGORIES ---
  getCategories() {
    return db.prepare('SELECT id, name_en, name_bn, icon, sort_order FROM categories ORDER BY sort_order ASC').all();
  },

  // --- DISTRICTS ---
  getDistricts() {
    return db.prepare('SELECT * FROM districts ORDER BY gsdp_rank ASC, name_en ASC').all();
  },

  getDistrictById(id) {
    const district = db.prepare('SELECT * FROM districts WHERE id = ?').get(id);
    if (!district) return null;
    // Attach associated projects and local observations
    const projects = db.prepare('SELECT * FROM projects WHERE district_id = ?').all(id);
    const observations = db.prepare(`
      SELECT o.*, i.name_en as indicator_name_en, i.name_bn as indicator_name_bn, i.unit as indicator_unit
      FROM indicator_observations o
      JOIN indicators i ON o.indicator_id = i.id
      WHERE o.district_id = ?
      ORDER BY o.period_year DESC
    `).all(id);
    return { ...district, projects, observations };
  },

  // --- INDICATORS & OBSERVATIONS ---
  getIndicators(pillar = null) {
    let sql = 'SELECT * FROM indicators';
    const params = [];
    if (pillar) {
      sql += ' WHERE pillar = ?';
      params.push(pillar);
    }
    sql += ' ORDER BY pillar ASC, category ASC, name_en ASC';
    const indicators = db.prepare(sql).all(...params);

    // Attach latest observation and historical array to each indicator
    const getObsStmt = db.prepare('SELECT * FROM indicator_observations WHERE indicator_id = ? ORDER BY period_year ASC');
    return indicators.map(ind => {
      const obs = getObsStmt.all(ind.id);
      const latest = obs.length > 0 ? obs[obs.length - 1] : null;
      return {
        ...ind,
        observations: obs,
        latestObservation: latest
      };
    });
  },

  getIndicatorById(id) {
    const ind = db.prepare('SELECT * FROM indicators WHERE id = ?').get(id);
    if (!ind) return null;
    const obs = db.prepare('SELECT * FROM indicator_observations WHERE indicator_id = ? ORDER BY period_year ASC').all(id);
    return { ...ind, observations: obs };
  },

  addIndicator(ind) {
    const id = ind.id || 'ind_' + (ind.code ? ind.code.toLowerCase().replace(/[^a-z0-9]/g, '-') : Date.now());
    db.prepare(`
      INSERT OR REPLACE INTO indicators (id, code, name_en, name_bn, category, pillar, unit, frequency, baseline_value, baseline_year, target_value, target_year, source_name, source_url, description_en, description_bn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      ind.code || id.toUpperCase(),
      ind.name_en,
      ind.name_bn || ind.name_en,
      ind.category || 'macro_economy',
      ind.pillar || 'economy',
      ind.unit || '',
      ind.frequency || 'annual',
      ind.baseline_value || null,
      ind.baseline_year || null,
      ind.target_value || null,
      ind.target_year || null,
      ind.source_name || '',
      ind.source_url || '',
      ind.description_en || '',
      ind.description_bn || ''
    );
    return { id, ...ind };
  },

  addObservation(obs) {
    const stmt = db.prepare(`
      INSERT INTO indicator_observations (indicator_id, district_id, period_year, value, unit, status, confidence_grade, source_name, source_url, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const res = stmt.run(
      obs.indicator_id,
      obs.district_id || null,
      obs.period_year,
      obs.value,
      obs.unit || '',
      obs.status || 'actual',
      obs.confidence_grade || 'A',
      obs.source_name || '',
      obs.source_url || '',
      obs.notes || ''
    );
    return { id: res.lastInsertRowid, ...obs };
  },

  // --- PROJECTS & MILESTONES ---
  getProjects(sector = null, stage = null) {
    let sql = 'SELECT p.*, d.name_en as district_name_en, d.name_bn as district_name_bn FROM projects p LEFT JOIN districts d ON p.district_id = d.id WHERE 1=1';
    const params = [];
    if (sector && sector !== 'all') {
      sql += ' AND p.sector = ?';
      params.push(sector);
    }
    if (stage && stage !== 'all') {
      sql += ' AND p.stage = ?';
      params.push(stage);
    }
    sql += ' ORDER BY p.cost_cr DESC NULLS LAST';
    const projects = db.prepare(sql).all(...params);

    const getMsStmt = db.prepare('SELECT * FROM project_milestones WHERE project_id = ? ORDER BY target_date ASC');
    return projects.map(p => ({
      ...p,
      milestones: getMsStmt.all(p.id)
    }));
  },

  getProjectById(id) {
    const p = db.prepare('SELECT p.*, d.name_en as district_name_en, d.name_bn as district_name_bn FROM projects p LEFT JOIN districts d ON p.district_id = d.id WHERE p.id = ?').get(id);
    if (!p) return null;
    const milestones = db.prepare('SELECT * FROM project_milestones WHERE project_id = ? ORDER BY target_date ASC').all(id);
    return { ...p, milestones };
  },

  saveProject(p) {
    const existing = p.id ? db.prepare('SELECT id FROM projects WHERE id = ?').get(p.id) : null;
    if (existing) {
      db.prepare(`
        UPDATE projects SET
          name_en = COALESCE(?, name_en),
          name_bn = COALESCE(?, name_bn),
          sector = COALESCE(?, sector),
          district_id = COALESCE(?, district_id),
          authority = COALESCE(?, authority),
          cost_cr = COALESCE(?, cost_cr),
          sanctioned_cost_cr = COALESCE(?, sanctioned_cost_cr),
          stage = COALESCE(?, stage),
          target_date = COALESCE(?, target_date),
          actual_date = COALESCE(?, actual_date),
          source_url = COALESCE(?, source_url),
          description_en = COALESCE(?, description_en),
          description_bn = COALESCE(?, description_bn)
        WHERE id = ?
      `).run(
        p.name_en || null,
        p.name_bn || null,
        p.sector || null,
        p.district_id || null,
        p.authority || null,
        p.cost_cr || null,
        p.sanctioned_cost_cr || null,
        p.stage || null,
        p.target_date || null,
        p.actual_date || null,
        p.source_url || null,
        p.description_en || null,
        p.description_bn || null,
        p.id
      );
    } else {
      const id = p.id || 'proj-' + Date.now();
      db.prepare(`
        INSERT INTO projects (id, name_en, name_bn, sector, district_id, authority, cost_cr, sanctioned_cost_cr, stage, target_date, actual_date, source_url, description_en, description_bn)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id,
        p.name_en,
        p.name_bn || p.name_en,
        p.sector || 'transport',
        p.district_id || null,
        p.authority || '',
        p.cost_cr || null,
        p.sanctioned_cost_cr || null,
        p.stage || 'under_construction',
        p.target_date || null,
        p.actual_date || null,
        p.source_url || '',
        p.description_en || '',
        p.description_bn || ''
      );
      p.id = id;
    }
    return p;
  },

  deleteProject(id) {
    db.prepare('DELETE FROM project_milestones WHERE project_id = ?').run(id);
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);
  },

  // --- EVIDENCE SUBMISSIONS (CITIZEN PORTAL & REVIEW WORKFLOW) ---
  addEvidenceSubmission(sub) {
    const id = 'ev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    db.prepare(`
      INSERT INTO evidence_submissions (id, target_type, target_id, source_url, title, event_date, district_id, submitter_name, submitter_email, explanation, status, confidence_grade)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      id,
      sub.target_type || 'general',
      sub.target_id || null,
      sub.source_url,
      sub.title,
      sub.event_date || new Date().toISOString().split('T')[0],
      sub.district_id || null,
      sub.submitter_name || 'Anonymous Citizen',
      sub.submitter_email || '',
      sub.explanation,
      sub.confidence_grade || 'B'
    );
    return { id, ...sub, status: 'pending' };
  },

  getEvidenceSubmissions(status = null) {
    let sql = 'SELECT * FROM evidence_submissions';
    const params = [];
    if (status && status !== 'all') {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY created_at DESC LIMIT 200';
    return db.prepare(sql).all(...params);
  },

  reviewEvidenceSubmission(id, newStatus, reviewerNotes, reviewerName, publishAsUpdate = false) {
    return this.runTransaction(() => {
      db.prepare(`
        UPDATE evidence_submissions SET
          status = ?,
          reviewer_notes = ?,
          reviewed_by = ?,
          reviewed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(newStatus, reviewerNotes || '', reviewerName || 'Reviewer', id);

      const submission = db.prepare('SELECT * FROM evidence_submissions WHERE id = ?').get(id);

      // If approved and requested to publish as an update to a promise
      if (newStatus === 'approved' && publishAsUpdate && submission && submission.target_id) {
        this.addUpdate({
          promiseId: submission.target_id,
          category: 'general',
          date: submission.event_date || new Date().toISOString().split('T')[0],
          title_en: submission.title,
          title_bn: submission.title,
          note_en: submission.explanation,
          note_bn: submission.explanation,
          confidence_grade: submission.confidence_grade || 'B',
          sources: [{ name: submission.submitter_name || 'Public Verified Submission', url: submission.source_url }]
        });
      }

      // Record audit log
      this.addAuditLog({
        action: 'EVIDENCE_REVIEW',
        entity_type: 'evidence_submission',
        entity_id: id,
        details: { newStatus, reviewerNotes, reviewerName, publishAsUpdate }
      });

      return submission;
    });
  },

  // --- STATUS HISTORY & AUDIT LOGS ---
  recordStatusTransition(t) {
    db.prepare(`
      INSERT INTO status_history (entity_type, entity_id, previous_status, new_status, reason, reviewer_name, evidence_url, confidence_grade)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      t.entity_type,
      t.entity_id,
      t.previous_status || null,
      t.new_status,
      t.reason || '',
      t.reviewer_name || 'Admin',
      t.evidence_url || '',
      t.confidence_grade || 'A'
    );
  },

  getStatusHistory(entityType = null, entityId = null) {
    let sql = 'SELECT * FROM status_history WHERE 1=1';
    const params = [];
    if (entityType) {
      sql += ' AND entity_type = ?';
      params.push(entityType);
    }
    if (entityId) {
      sql += ' AND entity_id = ?';
      params.push(entityId);
    }
    sql += ' ORDER BY created_at DESC LIMIT 150';
    return db.prepare(sql).all(...params);
  },

  addAuditLog(l) {
    const res = db.prepare(`
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      l.user_id || 'system',
      l.action,
      l.entity_type || null,
      l.entity_id || null,
      typeof l.details === 'object' ? JSON.stringify(l.details) : (l.details || null)
    );
    return { id: res.lastInsertRowid, ...l };
  },

  getAuditLogs(limit = 100) {
    const rows = db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit);
    return rows.map(r => ({
      ...r,
      details: r.details_json ? JSON.parse(r.details_json) : null
    }));
  },

  // --- PROMISES (PRESERVED & ENRICHED) ---
  getPromises(filterStatus = null, filterCategory = null) {
    let sql = 'SELECT * FROM promises WHERE 1=1';
    const params = [];
    if (filterStatus && filterStatus !== 'all') {
      sql += ' AND status = ?';
      params.push(filterStatus);
    }
    if (filterCategory && filterCategory !== 'all') {
      sql += ' AND category = ?';
      params.push(filterCategory);
    }
    sql += ' ORDER BY category ASC, number ASC';
    const rows = db.prepare(sql).all(...params);
    return rows.map(r => ({
      id: r.id,
      category: r.category,
      number: r.number,
      text_en: r.text_en,
      text_bn: r.text_bn,
      highlight_en: r.highlight_en,
      highlight_bn: r.highlight_bn,
      status: r.status,
      keyPromise: r.key_promise,
      keywords: r.keywords_json ? JSON.parse(r.keywords_json) : [],
      updateCount: r.update_count,
      latestUpdate: r.latest_update_json ? JSON.parse(r.latest_update_json) : null,
      confidence_grade: r.confidence_grade || 'B',
      district_id: r.district_id || null,
      department: r.department || null
    }));
  },

  getPromiseById(id) {
    const r = db.prepare('SELECT * FROM promises WHERE id = ?').get(id);
    if (!r) return null;
    const history = this.getStatusHistory('promise', id);
    const updates = db.prepare('SELECT * FROM updates WHERE promise_id = ? ORDER BY date DESC').all(id);
    return {
      id: r.id,
      category: r.category,
      number: r.number,
      text_en: r.text_en,
      text_bn: r.text_bn,
      highlight_en: r.highlight_en,
      highlight_bn: r.highlight_bn,
      status: r.status,
      keyPromise: r.key_promise,
      keywords: r.keywords_json ? JSON.parse(r.keywords_json) : [],
      updateCount: r.update_count,
      latestUpdate: r.latest_update_json ? JSON.parse(r.latest_update_json) : null,
      confidence_grade: r.confidence_grade || 'B',
      district_id: r.district_id || null,
      department: r.department || null,
      history,
      updates: updates.map(u => ({
        ...u,
        sources: u.sources_json ? JSON.parse(u.sources_json) : []
      }))
    };
  },

  savePromise(p, reviewerName = 'Admin', reason = '') {
    if (p.status) {
      p.status = normalizeStatus(p.status);
    }
    const existing = db.prepare('SELECT * FROM promises WHERE id = ?').get(p.id);
    if (existing) {
      const prevStatus = existing.status;
      db.prepare(`
        UPDATE promises SET
          category = COALESCE(?, category),
          text_en = COALESCE(?, text_en),
          text_bn = COALESCE(?, text_bn),
          highlight_en = COALESCE(?, highlight_en),
          highlight_bn = COALESCE(?, highlight_bn),
          status = COALESCE(?, status),
          key_promise = COALESCE(?, key_promise),
          keywords_json = COALESCE(?, keywords_json),
          confidence_grade = COALESCE(?, confidence_grade),
          district_id = COALESCE(?, district_id),
          department = COALESCE(?, department),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        p.category || null,
        p.text_en || null,
        p.text_bn || null,
        p.highlight_en || null,
        p.highlight_bn || null,
        p.status || null,
        p.keyPromise || null,
        p.keywords ? JSON.stringify(p.keywords) : null,
        p.confidence_grade || null,
        p.district_id || null,
        p.department || null,
        p.id
      );

      // Record transition if status changed
      if (p.status && p.status !== prevStatus) {
        this.recordStatusTransition({
          entity_type: 'promise',
          entity_id: p.id,
          previous_status: prevStatus,
          new_status: p.status,
          reason: reason || 'Status updated via admin console',
          reviewer_name: reviewerName,
          confidence_grade: p.confidence_grade || 'B'
        });
      }
    } else {
      db.prepare(`
        INSERT INTO promises (id, category, number, text_en, text_bn, highlight_en, highlight_bn, status, key_promise, keywords_json, confidence_grade, district_id, department)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        p.id,
        p.category || 'general',
        p.number || 0,
        p.text_en || '',
        p.text_bn || '',
        p.highlight_en || '',
        p.highlight_bn || '',
        p.status || 'pending',
        p.keyPromise || null,
        JSON.stringify(p.keywords || []),
        p.confidence_grade || 'B',
        p.district_id || null,
        p.department || null
      );

      this.recordStatusTransition({
        entity_type: 'promise',
        entity_id: p.id,
        previous_status: null,
        new_status: p.status || 'pending',
        reason: 'Initial creation',
        reviewer_name: reviewerName
      });
    }

    this.addAuditLog({
      action: existing ? 'PROMISE_UPDATE' : 'PROMISE_CREATE',
      entity_type: 'promise',
      entity_id: p.id,
      details: { category: p.category, status: p.status }
    });
  },

  deletePromise(id) {
    db.prepare('DELETE FROM promises WHERE id = ?').run(id);
    db.prepare('DELETE FROM updates WHERE promise_id = ?').run(id);
    this.addAuditLog({ action: 'PROMISE_DELETE', entity_type: 'promise', entity_id: id });
  },

  // --- UPDATES ---
  getUpdates(limit = 500, category = null) {
    let sql = 'SELECT * FROM updates WHERE 1=1';
    const params = [];
    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }
    sql += ' ORDER BY date DESC, id DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(sql).all(...params);
    return rows.map(r => ({
      id: r.id,
      promiseId: r.promise_id,
      category: r.category,
      date: r.date,
      title_en: r.title_en,
      title_bn: r.title_bn,
      note_en: r.note_en,
      note_bn: r.note_bn,
      confidence_grade: r.confidence_grade || 'B',
      district_id: r.district_id || null,
      event_date: r.event_date || r.date,
      sources: r.sources_json ? JSON.parse(r.sources_json) : []
    }));
  },

  addUpdate(u) {
    if (u.newStatus) {
      u.newStatus = normalizeStatus(u.newStatus);
    }
    db.prepare(`
      INSERT INTO updates (promise_id, category, date, title_en, title_bn, note_en, note_bn, sources_json, confidence_grade, district_id, event_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      u.promiseId || '',
      u.category || '',
      u.date || new Date().toISOString().split('T')[0],
      u.title_en || '',
      u.title_bn || u.title_en || '',
      u.note_en || '',
      u.note_bn || u.note_en || '',
      JSON.stringify(u.sources || []),
      u.confidence_grade || 'B',
      u.district_id || null,
      u.event_date || u.date || new Date().toISOString().split('T')[0]
    );

    if (u.promiseId) {
      const p = db.prepare('SELECT update_count, status FROM promises WHERE id = ?').get(u.promiseId);
      if (p) {
        const newCount = (p.update_count || 0) + 1;
        const latest = JSON.stringify({
          summary: u.title_en,
          sourceCount: (u.sources || []).length,
          date: u.date
        });
        db.prepare('UPDATE promises SET update_count = ?, latest_update_json = ?, status = COALESCE(?, status) WHERE id = ?')
          .run(newCount, latest, u.newStatus || null, u.promiseId);

        if (u.newStatus && u.newStatus !== p.status) {
          this.recordStatusTransition({
            entity_type: 'promise',
            entity_id: u.promiseId,
            previous_status: p.status,
            new_status: u.newStatus,
            reason: u.title_en,
            evidence_url: (u.sources && u.sources[0]) ? u.sources[0].url : '',
            confidence_grade: u.confidence_grade || 'B'
          });
        }
      }
    }

    db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)')
      .run('last_updated', u.date || new Date().toISOString().split('T')[0]);
  },

  // --- SCRAPED QUEUE ---
  getScrapedQueue() {
    const rows = db.prepare('SELECT * FROM scraped_queue ORDER BY created_at DESC LIMIT 150').all();
    return rows.map(r => ({
      id: r.id,
      scrapedAt: r.scraped_at,
      sourceName: r.source_name,
      sourceUrl: r.source_url,
      pubDate: r.pub_date,
      newsTitle: r.news_title,
      newsSnippet: r.news_snippet,
      matchedPromiseId: r.matched_promise_id,
      matchedPromiseText: r.matched_promise_text,
      matchedCategory: r.matched_category,
      confidenceScore: r.confidence_score,
      suggestedStatus: r.suggested_status,
      proposedTitleEn: r.proposed_title_en,
      proposedTitleBn: r.proposed_title_bn,
      proposedNoteEn: r.proposed_note_en,
      proposedNoteBn: r.proposed_note_bn
    }));
  },

  addToScrapedQueue(item) {
    db.prepare(`
      INSERT OR REPLACE INTO scraped_queue (id, scraped_at, source_name, source_url, pub_date, news_title, news_snippet, matched_promise_id, matched_promise_text, matched_category, confidence_score, suggested_status, proposed_title_en, proposed_title_bn, proposed_note_en, proposed_note_bn)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      item.id,
      item.scrapedAt,
      item.sourceName,
      item.sourceUrl,
      item.pubDate,
      item.newsTitle,
      item.newsSnippet,
      item.matchedPromiseId,
      item.matchedPromiseText,
      item.matchedCategory,
      item.confidenceScore,
      item.suggestedStatus,
      item.proposedTitleEn,
      item.proposedTitleBn,
      item.proposedNoteEn,
      item.proposedNoteBn
    );
  },

  removeFromScrapedQueue(id) {
    db.prepare('DELETE FROM scraped_queue WHERE id = ?').run(id);
  },

  // --- COMPREHENSIVE PLATFORM STATS ---
  getStats() {
    const totalRow = db.prepare('SELECT COUNT(*) as count FROM promises').get();
    const doneRow = db.prepare("SELECT COUNT(*) as count FROM promises WHERE status IN ('done', 'delivered')").get();
    const inprogRow = db.prepare("SELECT COUNT(*) as count FROM promises WHERE status IN ('inprogress', 'under_implementation', 'legally_initiated', 'funded', 'partially_delivered')").get();
    const evadedRow = db.prepare("SELECT COUNT(*) as count FROM promises WHERE status IN ('evaded', 'reversed', 'delayed', 'disputed', 'not_verifiable')").get();
    const pendingRow = db.prepare("SELECT COUNT(*) as count FROM promises WHERE status IS NULL OR status IN ('pending', 'not_started', 'announced')").get();
    const queueRow = db.prepare('SELECT COUNT(*) as count FROM scraped_queue').get();

    // New Civic Stats
    const districtsCount = db.prepare('SELECT COUNT(*) as count FROM districts').get();
    const indicatorsCount = db.prepare('SELECT COUNT(*) as count FROM indicators').get();
    const projectsCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
    const submissionsCount = db.prepare("SELECT COUNT(*) as count FROM evidence_submissions WHERE status = 'pending'").get();

    // 11-status breakdown
    const statusCounts = {};
    const statusRows = db.prepare('SELECT status, count(*) as count FROM promises GROUP BY status').all();
    for (const r of statusRows) {
      if (r.status) statusCounts[r.status] = r.count;
    }

    const total = totalRow.count;
    const done = doneRow.count;
    const inprogress = inprogRow.count;
    const evaded = evadedRow.count;
    const pending = pendingRow.count;
    const rate = total > 0 ? ((done / total) * 100).toFixed(1) : '0.0';

    return {
      total,
      done,
      inprogress,
      evaded,
      pending,
      delivered: done,
      under_implementation: inprogress,
      not_started: pending,
      statusBreakdown: statusCounts,
      rate,
      queueCount: queueRow.count,
      districtsCount: districtsCount.count,
      indicatorsCount: indicatorsCount.count,
      projectsCount: projectsCount.count,
      pendingSubmissionsCount: submissionsCount.count
    };
  },

  getDetailedUpdates(promiseId) {
    const row = db.prepare('SELECT data_json FROM promise_detailed_updates WHERE promise_id = ?').get(promiseId);
    if (!row) return null;
    try {
      return JSON.parse(row.data_json);
    } catch (e) {
      return null;
    }
  }
};
