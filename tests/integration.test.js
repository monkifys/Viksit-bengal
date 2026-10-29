/**
 * Integration Test Suite for Viksit Bengal Dashboard
 * Testing database persistence, queries, updates, audit logging, and data models.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../db.js');

test('Integration - Database Initial State & Seed Data', () => {
  const stats = db.getStats();
  assert.ok(stats.total >= 140, `Expected at least 140 promises, got ${stats.total}`);
  assert.equal(stats.districtsCount, 23, 'Should have all 23 districts seeded');
  assert.ok(stats.indicatorsCount >= 10, 'Should have macroeconomic and social indicators');
  assert.ok(stats.projectsCount >= 6, 'Should have major infrastructure projects');
});

test('Integration - Districts Retrieval & Query by ID', () => {
  const districts = db.getDistricts();
  assert.equal(districts.length, 23);

  const kolkata = db.getDistrictById('kolkata');
  assert.ok(kolkata);
  assert.equal(kolkata.name_en, 'Kolkata');
  assert.equal(kolkata.division, 'Presidency');
  assert.ok(kolkata.literacy_rate > 80);

  const nonExistent = db.getDistrictById('non_existent_district');
  assert.equal(nonExistent, null);
});

test('Integration - Indicators & Time-Series Observations', () => {
  const indicators = db.getIndicators();
  assert.ok(indicators.length >= 10);

  const gsdp = db.getIndicatorById('gsdp-nominal');
  assert.ok(gsdp);
  assert.equal(gsdp.pillar, 'economy');
  assert.ok(gsdp.observations && gsdp.observations.length > 0);

  // Add a test observation
  const obs = db.addObservation({
    indicator_id: 'gsdp-nominal',
    period_year: '2026-27 (Test)',
    value: 22.5,
    notes: 'Integration test observation'
  });
  assert.ok(obs && obs.id);

  // Verify observation reflected in indicator
  const updatedGsdp = db.getIndicatorById('gsdp-nominal');
  const foundObs = updatedGsdp.observations.find(o => o.period_year === '2026-27 (Test)');
  assert.ok(foundObs);
  assert.equal(foundObs.value, 22.5);
});

test('Integration - Infrastructure Projects & Lifecycle', () => {
  // Create a new project
  const testProject = {
    name_en: 'Durgapur Industrial Logistics Park',
    name_bn: 'দুর্গাপুর শিল্প লজিস্টিক পার্ক',
    sector: 'Industry',
    district: 'Paschim Bardhaman',
    authority: 'WBIDC',
    cost_cr: 1250,
    stage: 'funded',
    target_completion: '2027-12',
    description_en: 'Multi-modal freight handling and logistics warehouse hub.',
    description_bn: 'মাল্টি-মোডাল মাল পরিবহন ও লজিস্টিক গুদাম হাব।'
  };

  const saved = db.saveProject(testProject);
  assert.ok(saved.id);
  assert.equal(saved.name_en, 'Durgapur Industrial Logistics Park');

  // Retrieve project by ID
  const retrieved = db.getProjectById(saved.id);
  assert.ok(retrieved);
  assert.equal(retrieved.cost_cr, 1250);

  // Update project stage
  saved.stage = 'under_construction';
  const updated = db.saveProject(saved);
  assert.equal(updated.stage, 'under_construction');

  // Delete project
  db.deleteProject(saved.id);
  const deleted = db.getProjectById(saved.id);
  assert.equal(deleted, null);
});

test('Integration - Citizen Evidence Submission & Review Flow', () => {
  const submission = db.addEvidenceSubmission({
    source_url: 'https://wb.gov.in/gazette/order-2026-test.pdf',
    title: 'Gazette Notification on Industrial Subsidies',
    explanation: 'Official government order granting capital subsidies to MSMEs.',
    target_type: 'promise',
    target_id: 'economy-1',
    event_date: '2026-10-25',
    district_id: 'howrah',
    submitter_name: 'Dr. S. Mukherjee',
    submitter_email: 'researcher@bengal-civic.org',
    confidence_grade: 'A'
  });

  assert.ok(submission.id);
  assert.equal(submission.status, 'pending');

  // Verify in pending submissions queue
  const pendingQueue = db.getEvidenceSubmissions('pending');
  const foundInQueue = pendingQueue.find(s => s.id === submission.id);
  assert.ok(foundInQueue);

  // Review and approve with publishing
  const reviewed = db.reviewEvidenceSubmission(
    submission.id,
    'approved',
    'Verified via official West Bengal Gazette notification.',
    'reviewer1',
    true // publish as update
  );

  assert.equal(reviewed.status, 'approved');
  assert.equal(reviewed.reviewed_by, 'reviewer1');

  // Verify published update was created in updates table
  const updates = db.getUpdates(100);
  const matchedUpdate = updates.find(u => u.title_en === 'Gazette Notification on Industrial Subsidies');
  assert.ok(matchedUpdate, 'Should create a published timeline update when approved with publish flag');
});

test('Integration - Status History & Immutable Audit Logging', () => {
  // Add an audit log entry
  const log = db.addAuditLog({
    user_id: 'admin',
    action: 'TEST_AUDIT_ACTION',
    entity_type: 'promise',
    entity_id: 'economy-1',
    details: { reason: 'Test verification trail' }
  });

  assert.ok(log && log.id);

  // Query audit logs
  const logs = db.getAuditLogs(20);
  const foundLog = logs.find(l => l.action === 'TEST_AUDIT_ACTION');
  assert.ok(foundLog);
  assert.equal(foundLog.user_id, 'admin');
});

test('Integration - Atomic Transaction and Rollback on Failure', () => {
  const initialUpdatesCount = db.getUpdates(1000).length;
  const initialLogsCount = db.getAuditLogs(1000).length;

  let errorThrown = false;
  try {
    db.runTransaction(() => {
      // 1. Insert update
      db.addUpdate({
        promiseId: 'economy-1',
        category: 'economy',
        date: '2026-10-29',
        title_en: 'Synthetic Update That Must Rollback',
        title_bn: 'সিন্থেটিক আপডেট',
        note_en: 'Testing atomicity',
        note_bn: 'পরমাণুত্ব পরীক্ষা'
      });

      // 2. Insert audit log
      db.addAuditLog({
        user_id: 'tester',
        action: 'SYNTHETIC_ACTION',
        entity_type: 'update',
        details: { test: true }
      });

      // 3. Throw intentional error to simulate mid-transaction failure
      throw new Error('Synthetic database failure for rollback test');
    });
  } catch (err) {
    errorThrown = true;
    assert.equal(err.message, 'Synthetic database failure for rollback test');
  }

  assert.ok(errorThrown, 'Expected transaction to throw synthetic error');

  // Verify that neither the update nor the audit log was persisted
  const afterUpdatesCount = db.getUpdates(1000).length;
  const afterLogsCount = db.getAuditLogs(1000).length;

  assert.equal(afterUpdatesCount, initialUpdatesCount, 'Update insertion must be rolled back on error');
  assert.equal(afterLogsCount, initialLogsCount, 'Audit log insertion must be rolled back on error');

  // Verify successful transaction commits cleanly
  const commitResult = db.runTransaction(() => {
    db.addAuditLog({
      user_id: 'tester',
      action: 'ATOMIC_COMMIT_TEST',
      entity_type: 'system',
      details: { committed: true }
    });
    return 'transaction_ok';
  });

  assert.equal(commitResult, 'transaction_ok');
  const committedLogs = db.getAuditLogs(10);
  assert.ok(committedLogs.some(l => l.action === 'ATOMIC_COMMIT_TEST'), 'Committed action must be persisted');
});

test('Integration - Complete 11-Stage Civic Statuses & Legacy Migration Verification', () => {
  // 1. Verify schema migrations ran
  const migrationRecord = db.db.prepare('SELECT version FROM schema_migrations WHERE version = ?').get('migrate_legacy_promise_statuses_v1');
  assert.ok(migrationRecord, 'migrate_legacy_promise_statuses_v1 should be recorded');

  // 2. Verify legacy migration audit table has preserved original records
  const legacyCount = db.db.prepare('SELECT COUNT(*) as count FROM legacy_status_migrations').get();
  assert.ok(legacyCount.count >= 140, 'Should preserve at least 140 legacy migrated rows');

  // 3. Verify that all 142 promises now use standardized status values (zero legacy statuses remain)
  const legacyRemaining = db.db.prepare("SELECT COUNT(*) as count FROM promises WHERE status IN ('pending', 'inprogress', 'done', 'evaded')").get();
  assert.equal(legacyRemaining.count, 0, 'No legacy statuses should remain in promises table');

  // 4. Verify each of the 11 statuses can be saved and persisted
  const testPromiseId = 'economy-1';
  for (const status of db.VALID_PROMISE_STATUSES) {
    db.savePromise({ id: testPromiseId, status }, 'test-suite', `Testing transition to ${status}`);
    const updated = db.getPromiseById(testPromiseId);
    assert.equal(updated.status, status, `Promise should reflect standardized status: ${status}`);
  }

  // 5. Verify legacy status normalization (e.g. 'inprogress' -> 'under_implementation')
  db.savePromise({ id: testPromiseId, status: 'inprogress' }, 'test-suite', 'Testing legacy alias normalization');
  const normalized = db.getPromiseById(testPromiseId);
  assert.equal(normalized.status, 'under_implementation', 'Legacy inprogress must normalize to under_implementation');
});

test('Integration - Evidence Approval Failure Injection & Atomic Rollback', () => {
  const sub = db.addEvidenceSubmission({
    source_url: 'https://wb.gov.in/test-failure-injection.pdf',
    title: 'Failure Injection Test Submission',
    explanation: 'Testing rollback of evidence approval workflow.',
    target_type: 'promise',
    target_id: 'economy-1',
    confidence_grade: 'A'
  });

  assert.ok(sub.id);
  const initialSub = db.getEvidenceSubmissions().find(s => s.id === sub.id);
  assert.equal(initialSub.status, 'pending');

  const initialUpdatesCount = db.getUpdates(1000).length;
  const initialAuditLogsCount = db.getAuditLogs(1000).length;

  // Monkey-patch addAuditLog to inject a failure after update insertion
  const originalAddAuditLog = db.addAuditLog.bind(db);
  db.addAuditLog = function(entry) {
    if (entry.action === 'EVIDENCE_REVIEW' && entry.entity_id === sub.id) {
      throw new Error('Simulated disk/database failure during audit log insertion');
    }
    return originalAddAuditLog(entry);
  };

  let caughtError = null;
  try {
    db.reviewEvidenceSubmission(
      sub.id,
      'approved',
      'Should fail and rollback completely',
      'test-reviewer',
      true
    );
  } catch (err) {
    caughtError = err;
  } finally {
    db.addAuditLog = originalAddAuditLog;
  }

  assert.ok(caughtError, 'Transaction must throw the injected failure');
  assert.equal(caughtError.message, 'Simulated disk/database failure during audit log insertion');

  // Verify complete rollback
  const subAfterRollback = db.db.prepare('SELECT status, reviewer_notes, reviewed_by FROM evidence_submissions WHERE id = ?').get(sub.id);
  assert.equal(subAfterRollback.status, 'pending', 'Submission status must rollback to pending');
  assert.equal(subAfterRollback.reviewed_by, null, 'reviewed_by must remain null');

  const afterUpdatesCount = db.getUpdates(1000).length;
  assert.equal(afterUpdatesCount, initialUpdatesCount, 'No update record should be created if transaction aborted');

  const afterAuditLogsCount = db.getAuditLogs(1000).length;
  assert.equal(afterAuditLogsCount, initialAuditLogsCount, 'No audit log should be committed if transaction aborted');

  // Verify successful approval works cleanly after error resolution
  const approved = db.reviewEvidenceSubmission(
    sub.id,
    'approved',
    'Now cleanly approved',
    'test-reviewer',
    true
  );
  assert.equal(approved.status, 'approved');

  // Verify rejection workflow
  const rejSub = db.addEvidenceSubmission({
    source_url: 'https://wb.gov.in/test-rejection.pdf',
    title: 'Submission To Be Rejected',
    explanation: 'Testing rejection workflow.',
    target_type: 'promise',
    target_id: 'economy-1',
    confidence_grade: 'D'
  });

  const rejected = db.reviewEvidenceSubmission(
    rejSub.id,
    'rejected',
    'Insufficient evidence',
    'test-reviewer',
    false
  );
  assert.equal(rejected.status, 'rejected');

  const subRejected = db.db.prepare('SELECT status, reviewer_notes FROM evidence_submissions WHERE id = ?').get(rejSub.id);
  assert.equal(subRejected.status, 'rejected');

  const rejectedUpdate = db.getUpdates(10).find(u => u.title_en === 'Submission To Be Rejected');
  assert.equal(rejectedUpdate, undefined, 'No update must be published for rejected submission');
});


