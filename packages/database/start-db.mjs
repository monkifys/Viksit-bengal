import EmbeddedPostgres from 'embedded-postgres';
import fs from 'fs';
import path from 'path';

async function run() {
  const dbDir = path.resolve('./.pgdata');
  
  // If databaseDir exists and needs UTF8 reset, check and reset
  if (fs.existsSync(dbDir)) {
    try {
      const tempPg = new EmbeddedPostgres({ databaseDir: dbDir, port: 5432, user: 'postgres', password: 'password', persistent: true });
      await tempPg.stop();
    } catch (e) {
      // ignore
    }
    fs.rmSync(dbDir, { recursive: true, force: true });
    console.log('Cleared existing .pgdata for UTF8 re-initialization');
  }

  const pg = new EmbeddedPostgres({
    databaseDir: dbDir,
    port: 5432,
    user: 'postgres',
    password: 'password',
    persistent: true,
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
  });

  console.log('Initializing cluster with UTF8 encoding...');
  await pg.initialise();
  console.log('Cluster initialized with UTF8');

  console.log('Starting PostgreSQL on port 5432...');
  await pg.start();
  console.log('PostgreSQL started');

  try {
    await pg.createDatabase('viksit_bengal');
    console.log('Created database viksit_bengal');
  } catch (err) {
    console.log('createDatabase result:', err.message);
  }

  console.log('PostgreSQL ready: postgresql://postgres:password@localhost:5432/viksit_bengal?schema=public');

  // Keep alive
  setInterval(() => {}, 60000);
}

run().catch((err) => {
  console.error('Fatal DB start error:', err);
  process.exit(1);
});
