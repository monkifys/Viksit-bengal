const test = require('node:test');
const assert = require('node:assert/strict');
const db = require('../db.js');

test('Transactional Integrity - Evidence Approval Failure Injection & Rollback', () => {
  // 1. Create a pristine test evidence submission
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

  // 2. Monkey-patch addAuditLog to inject a failure after update insertion
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
      true // publishAsUpdate = true
    );
  } catch (err) {
    caughtError = err;
  } finally {
    // Restore original method immediately
    db.addAuditLog = originalAddAuditLog;
  }

  assert.ok(caughtError, 'Transaction must throw the injected failure');
  assert.equal(caughtError.message, 'Simulated disk/database failure during audit log insertion');

  // 3. Verify complete rollback:
  // - Submission status must still be 'pending'
  const subAfterRollback = db.db.prepare('SELECT status, reviewer_notes, reviewed_by FROM evidence_submissions WHERE id = ?').get(sub.id);
  assert.equal(subAfterRollback.status, 'pending', 'Submission status must rollback to pending');
  assert.equal(subAfterRollback.reviewed_by, null, 'reviewed_by must remain null');

  // - No update record should exist in updates table
  const afterUpdatesCount = db.getUpdates(1000).length;
  assert.equal(afterUpdatesCount, initialUpdatesCount, 'No update record should be created if transaction aborted');

  // - No audit log should exist
  const afterAuditLogsCount = db.getAuditLogs(1000).length;
  assert.equal(afterAuditLogsCount, initialAuditLogsCount, 'No audit log should be committed if transaction aborted');

  // 4. Verify successful approval works cleanly after error resolution
  const approved = db.reviewEvidenceSubmission(
    sub.id,
    'approved',
    'Now cleanly approved',
    'test-reviewer',
    true
  );
  assert.equal(approved.status, 'approved');

  const subApproved = db.db.prepare('SELECT status, reviewer_notes, reviewed_by FROM evidence_submissions WHERE id = ?').get(sub.id);
  assert.equal(subApproved.status, 'approved');
  assert.equal(subApproved.reviewed_by, 'test-reviewer');

  const updateCreated = db.getUpdates(10).find(u => u.title_en === 'Failure Injection Test Submission');
  assert.ok(updateCreated, 'Update must be published on successful commit');

  // 5. Verify rejection workflow (should update status, not publish update, but write audit log)
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
    false // publishAsUpdate = false
  );
  assert.equal(rejected.status, 'rejected');

  const subRejected = db.db.prepare('SELECT status, reviewer_notes FROM evidence_submissions WHERE id = ?').get(rejSub.id);
  assert.equal(subRejected.status, 'rejected');

  const rejectedUpdate = db.getUpdates(10).find(u => u.title_en === 'Submission To Be Rejected');
  assert.equal(rejectedUpdate, undefined, 'No update must be published for rejected submission');

  console.log('✅ Transactional Integrity - Evidence Approval Failure Injection & Rollback PASSED');
});
