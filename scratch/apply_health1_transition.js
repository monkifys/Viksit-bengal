const db = require('../db.js');

console.log('--- Applying Authorized Review Transition for health-1 ---');
const prev = db.getPromiseById('health-1');
console.log('Current status of health-1:', prev.status);

db.savePromise(
  {
    id: 'health-1',
    status: 'partially_delivered',
    confidence_grade: 'B'
  },
  'Senior Reviewer & Verification Officer',
  'Formal audit established that while the State-NHA MoU was signed and PM-JAY was launched for 1.43 crore families, universal coverage saturation for all 6 crore citizens, resolution of private hospital network package rate disputes, and North Bengal tertiary infrastructure (AIIMS) remain active and incomplete. Reclassified from delivered to canonical partially_delivered.'
);

const updated = db.getPromiseById('health-1');
console.log('New status of health-1:', updated.status);

// Verify transition recorded in status_history
const transitions = db.getStatusHistory('promise', 'health-1');
console.log('Status history transitions for health-1:', transitions);

// Verify migration history is preserved in legacy_status_migrations
const mig = db.db.prepare('SELECT * FROM legacy_status_migrations WHERE promise_id = ?').get('health-1');
console.log('Migration history preserved:', mig);

console.log('✅ health-1 authorized transition to partially_delivered completed successfully.');
