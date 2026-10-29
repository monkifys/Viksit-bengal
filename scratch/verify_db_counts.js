const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('database.sqlite');
const backup = new DatabaseSync('database_backup_baseline.sqlite');

console.log('=== ACTIVE DATABASE (database.sqlite) ===');
const totalActive = db.prepare('SELECT count(*) as count FROM promises').get().count;
console.log('Total promises in active DB:', totalActive);
const activeStatuses = db.prepare('SELECT status, count(*) as count FROM promises GROUP BY status').all();
console.log('Active DB statuses:', activeStatuses);

const tableInfo = db.prepare("PRAGMA table_info(legacy_status_migrations)").all();
console.log('legacy_status_migrations table columns:', tableInfo);

const migCount = db.prepare('SELECT count(*) as count FROM legacy_status_migrations').get().count;
console.log('legacy_status_migrations total entries:', migCount);
const migBreakdown = db.prepare('SELECT legacy_status, migrated_status, count(*) as count FROM legacy_status_migrations GROUP BY legacy_status, migrated_status').all();
console.log('Migration breakdown:', migBreakdown);
const sampleMig = db.prepare('SELECT * FROM legacy_status_migrations LIMIT 5').all();
console.log('Sample migration entries:', sampleMig);

console.log('\n=== BASELINE BACKUP DATABASE (database_backup_baseline.sqlite) ===');
const totalBackup = backup.prepare('SELECT count(*) as count FROM promises').get().count;
console.log('Total promises in backup DB:', totalBackup);
const backupStatuses = backup.prepare('SELECT status, count(*) as count FROM promises GROUP BY status').all();
console.log('Backup DB statuses:', backupStatuses);

console.log('\n=== INVESTIGATE EARLIER REPORT OF 137 LEGACY RECORDS ===');
// Why did earlier reports say 137?
// Let's check how many were legacy in backup:
// pending (71) + inprogress (66) + done (3) = 140
// Were there promises with other statuses or was 137 calculated differently?
const backupAll = backup.prepare('SELECT id, status FROM promises').all();
console.log('Backup records count:', backupAll.length);
const notStartedInBackup = backup.prepare("SELECT count(*) as count FROM promises WHERE status = 'not_started'").get().count;
console.log("Promises with status = 'not_started' in backup:", notStartedInBackup);
const pendingInBackup = backup.prepare("SELECT count(*) as count FROM promises WHERE status = 'pending'").get().count;
console.log("Promises with status = 'pending' in backup:", pendingInBackup);
const inprogressInBackup = backup.prepare("SELECT count(*) as count FROM promises WHERE status = 'inprogress'").get().count;
console.log("Promises with status = 'inprogress' in backup:", inprogressInBackup);
const doneInBackup = backup.prepare("SELECT count(*) as count FROM promises WHERE status = 'done'").get().count;
console.log("Promises with status = 'done' in backup:", doneInBackup);
console.log('Sum of pending + inprogress + done:', pendingInBackup + inprogressInBackup + doneInBackup);
console.log('Sum of pending + inprogress:', pendingInBackup + inprogressInBackup);

console.log('\n=== INTEGRITY CHECKS ===');
console.log('Active DB integrity_check:', db.prepare('PRAGMA integrity_check').all());
console.log('Active DB foreign_key_check:', db.prepare('PRAGMA foreign_key_check').all());
console.log('Backup DB integrity_check:', backup.prepare('PRAGMA integrity_check').all());
console.log('Backup DB foreign_key_check:', backup.prepare('PRAGMA foreign_key_check').all());
