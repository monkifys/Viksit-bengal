const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('database.sqlite');

// Check if notes column exists in legacy_status_migrations
const cols = db.prepare('PRAGMA table_info(legacy_status_migrations)').all().map(c => c.name);
if (!cols.includes('notes')) {
  db.exec('ALTER TABLE legacy_status_migrations ADD COLUMN notes TEXT;');
  console.log('Added notes column to legacy_status_migrations');
}

// Update health-1 with review_flag = 1
db.prepare(`
  UPDATE legacy_status_migrations
  SET review_flag = 1,
      notes = 'Flagged for authorized civic review: State-level Ayushman Bharat PM-JAY MoU signed and rolled out; however, secondary components (AIIMS/IIT/IIM in North Bengal) and private hospital network package rates remain under active operational review.'
  WHERE promise_id = 'health-1'
`).run();

// Confirm update
const updatedHealth1 = db.prepare("SELECT * FROM legacy_status_migrations WHERE promise_id = 'health-1'").get();
console.log('Updated health-1 record:', updatedHealth1);

// Also check women-1 and youth-3 notes
db.prepare(`
  UPDATE legacy_status_migrations
  SET notes = 'Verified: Annapurna Yojana DBT rolled out with Gazette Notification No. 2411-WCD/O/AB-4/2026, 28 lakh women funded, ₹36,000 Cr allocated in State Budget.'
  WHERE promise_id = 'women-1'
`).run();

db.prepare(`
  UPDATE legacy_status_migrations
  SET notes = 'Verified: 5-year upper age limit relaxation promulgated under Article 309 of Constitution via Notification No. 1707-F(P2) & 2619-F(P2).'
  WHERE promise_id = 'youth-3'
`).run();

console.log('Delivered promises review notes recorded.');
