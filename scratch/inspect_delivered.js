const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('database.sqlite');

const deliveredPromises = db.prepare(`
  SELECT id, category, number, text_en, text_bn, highlight_en, highlight_bn, status, update_count, confidence_grade
  FROM promises
  WHERE status = 'delivered'
`).all();

console.log('=== DELIVERED PROMISES (COUNT: ' + deliveredPromises.length + ') ===');
for (const p of deliveredPromises) {
  console.log(`\n======================================================`);
  console.log(`Promise ID: ${p.id} | Category: ${p.category} | Number: ${p.number}`);
  console.log(`Status: ${p.status} | Confidence Grade: ${p.confidence_grade} | Update Count: ${p.update_count}`);
  console.log(`Text EN: ${p.text_en}`);
  console.log(`Highlight EN: ${p.highlight_en}`);
  
  // Check updates associated with this promise
  const updates = db.prepare('SELECT id, date, title_en, note_en, sources_json, confidence_grade FROM updates WHERE promise_id = ?').all(p.id);
  console.log(`Associated Updates Count: ${updates.length}`);
  for (const u of updates) {
    console.log(`  - Update [${u.id}] Date: ${u.date} | Grade: ${u.confidence_grade}`);
    console.log(`    Title EN: ${u.title_en}`);
    console.log(`    Note EN: ${u.note_en.substring(0, 150)}...`);
    console.log(`    Sources: ${u.sources_json}`);
  }

  // Check evidence submissions associated with this promise
  const submissions = db.prepare('SELECT id, status, source_url, explanation, reviewer_notes FROM evidence_submissions WHERE target_id = ?').all(p.id);
  console.log(`Associated Submissions Count: ${submissions.length}`);
  for (const s of submissions) {
    console.log(`  - Submission [${s.id}] Status: ${s.status} | Source: ${s.source_url}`);
    console.log(`    Explanation: ${s.explanation}`);
  }

  // Check migration record
  const mig = db.prepare('SELECT * FROM legacy_status_migrations WHERE promise_id = ?').get(p.id);
  console.log('Migration record:', mig);
}
