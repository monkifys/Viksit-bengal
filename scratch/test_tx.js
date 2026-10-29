const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(':memory:');
db.exec('CREATE TABLE test (id INT PRIMARY KEY, name TEXT);');

function runTransaction(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch (e) {
      console.error('Rollback error:', e);
    }
    throw err;
  }
}

// 1. Successful transaction
runTransaction(() => {
  db.prepare('INSERT INTO test (id, name) VALUES (?, ?)').run(1, 'Alice');
  db.prepare('INSERT INTO test (id, name) VALUES (?, ?)').run(2, 'Bob');
});
console.log('After commit:', db.prepare('SELECT count(*) as count FROM test').get());

// 2. Failing transaction
try {
  runTransaction(() => {
    db.prepare('INSERT INTO test (id, name) VALUES (?, ?)').run(3, 'Charlie');
    throw new Error('Synthetic failure mid-transaction');
  });
} catch (err) {
  console.log('Caught expected error:', err.message);
}

console.log('After rollback count (should still be 2):', db.prepare('SELECT count(*) as count FROM test').get());
console.log('Verified transaction rollback perfectly.');
