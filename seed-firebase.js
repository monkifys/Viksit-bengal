/**
 * Firebase Migration & Bulk Seeder
 * Uploads all promises, updates, setbacks, and metadata into Firebase Firestore.
 */

const { getFirestore, isFirebaseConnected } = require('./firebase');
const db = require('./db');

async function seedToFirestore() {
  const firestore = getFirestore();
  if (!isFirebaseConnected() || !firestore) {
    console.log('⚠️ Firebase is not connected to a live cloud project yet.');
    console.log('👉 To connect your Firebase project:');
    console.log('   1. Create a Firebase project at https://console.firebase.google.com/');
    console.log('   2. Go to Project Settings > Service Accounts > Generate New Private Key');
    console.log('   3. Save the downloaded JSON file as "serviceAccountKey.json" in this directory:');
    console.log(`      c:\\Users\\mahap\\OneDrive\\Desktop\\Industrial Training\\serviceAccountKey.json`);
    console.log('   4. Run: npm run firebase:seed');
    return;
  }

  console.log('🔥 Beginning bulk upload to Firebase Cloud Firestore...');

  // 1. Upload Settings
  const settings = db.getSettings();
  await firestore.collection('settings').doc('site_meta').set(settings, { merge: true });
  console.log('✅ Site settings uploaded to Firestore.');

  // 2. Upload Categories
  const categories = db.getCategories();
  for (const cat of categories) {
    await firestore.collection('categories').doc(cat.id).set(cat, { merge: true });
  }
  console.log(`✅ ${categories.length} categories uploaded to Firestore.`);

  // 3. Upload Promises (batch writes)
  const promises = db.getPromises();
  console.log(`Uploading ${promises.length} promises to Firestore...`);
  for (let i = 0; i < promises.length; i += 100) {
    const batch = firestore.batch();
    const chunk = promises.slice(i, i + 100);
    chunk.forEach(p => {
      const ref = firestore.collection('promises').doc(p.id);
      batch.set(ref, p, { merge: true });
    });
    await batch.commit();
  }
  console.log('✅ All promises uploaded to Firestore.');

  // 4. Upload Detailed Updates & Setbacks
  const detailed = db.db.prepare('SELECT promise_id, data_json FROM promise_detailed_updates').all();
  console.log(`Uploading ${detailed.length} detailed updates & setback dossiers to Firestore...`);
  for (let i = 0; i < detailed.length; i += 50) {
    const batch = firestore.batch();
    const chunk = detailed.slice(i, i + 50);
    chunk.forEach(d => {
      const ref = firestore.collection('promise_detailed_updates').doc(d.promise_id);
      try {
        batch.set(ref, { promiseId: d.promise_id, data: JSON.parse(d.data_json) }, { merge: true });
      } catch (e) {}
    });
    await batch.commit();
  }
  console.log('✅ All detailed updates & setbacks uploaded to Firestore.');

  console.log('\n🎉 Firebase Cloud Firestore synchronization complete!');
}

if (require.main === module) {
  seedToFirestore().catch(console.error);
}

module.exports = { seedToFirestore };
