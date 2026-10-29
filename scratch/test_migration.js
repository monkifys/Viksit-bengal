const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

fs.copyFileSync('database_backup_baseline.sqlite', 'scratch_test_db.sqlite');
const db = new DatabaseSync('scratch_test_db.sqlite');
db.exec('PRAGMA foreign_keys = ON;');
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

const alreadyRun = db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('migrate_legacy_promise_statuses_v1');
console.log('Already run:', !!alreadyRun);

if (!alreadyRun) {
  db.exec('BEGIN TRANSACTION;');
  const legacyRows = db.prepare("SELECT id, status FROM promises WHERE status IN ('pending', 'inprogress', 'done', 'evaded')").all();
  console.log('Found legacy rows to migrate:', legacyRows.length);
  
  const ins = db.prepare('INSERT OR REPLACE INTO legacy_status_migrations (promise_id, legacy_status, migrated_status, review_flag) VALUES (?, ?, ?, ?)');
  for (const r of legacyRows) {
    let newStatus = r.status === 'pending' ? 'not_started' : r.status === 'inprogress' ? 'under_implementation' : r.status === 'done' ? 'delivered' : 'not_verifiable';
    let flag = r.status === 'evaded' ? 1 : 0;
    ins.run(r.id, r.status, newStatus, flag);
  }
  
  db.exec(`
    UPDATE promises SET status = 'not_started' WHERE status = 'pending';
    UPDATE promises SET status = 'under_implementation' WHERE status = 'inprogress';
    UPDATE promises SET status = 'delivered' WHERE status = 'done';
    UPDATE promises SET status = 'not_verifiable' WHERE status = 'evaded';
  `);
  
  db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run('migrate_legacy_promise_statuses_v1');
  db.exec('COMMIT;');
}

const newDist = db.prepare('SELECT status, count(*) as count FROM promises GROUP BY status').all();
console.log('New distribution:', newDist);

const migrationLog = db.prepare('SELECT count(*) as count, review_flag FROM legacy_status_migrations GROUP BY review_flag').all();
console.log('Migration audit records:', migrationLog);

db.close();
fs.unlinkSync('scratch_test_db.sqlite');
console.log('Test completed successfully and scratch DB cleaned up.');
