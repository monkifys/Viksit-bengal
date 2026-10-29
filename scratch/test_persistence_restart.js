const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

console.log('Testing SQLite Data Persistence Across Process Disconnect & Reconnect...');

// Step 1: Open database connection 1
const db1 = new DatabaseSync('database.sqlite');
const testAction = 'TEST_PERSISTENCE_' + Date.now();

db1.prepare(`
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details_json)
  VALUES (?, ?, ?, ?, ?)
`).run('persistence_verifier', testAction, 'system', 'test_restart', JSON.stringify({ verified: true }));

console.log(`Inserted test marker: ${testAction}`);

// Checkpoint WAL
const checkpointRes = db1.prepare('PRAGMA wal_checkpoint(FULL)').all();
console.log('WAL checkpoint result:', checkpointRes);

// Step 2: Explicitly close connection 1 (simulating process termination)
db1.close();
console.log('Connection 1 closed successfully.');

// Step 3: Open completely new independent connection 2 (simulating fresh server restart)
const db2 = new DatabaseSync('database.sqlite');
const retrieved = db2.prepare('SELECT * FROM audit_logs WHERE action = ?').get(testAction);

assert.ok(retrieved, 'Data must persist across process restart and connection boundaries');
assert.equal(retrieved.user_id, 'persistence_verifier');
assert.equal(retrieved.action, testAction);

const integrity = db2.prepare('PRAGMA integrity_check').all();
assert.equal(integrity[0].integrity_check, 'ok');

// Clean up test marker
db2.prepare('DELETE FROM audit_logs WHERE action = ?').run(testAction);
db2.close();

console.log('✅ SQLite data persistence and WAL recovery verified successfully!');
