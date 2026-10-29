/**
 * Firebase Firestore & Cloud Database Integration Layer
 * Connects WB Accountability Tracker to Google Cloud Firebase.
 */

const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

let firestoreDb = null;
let isConnected = false;
let projectId = null;

const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'serviceAccountKey.json');

function initFirebase() {
  try {
    // 1. Check if serviceAccountKey.json exists in root
    if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf-8'));
      if (!getApps().length) {
        initializeApp({
          credential: cert(serviceAccount)
        });
      }
      firestoreDb = getFirestore();
      isConnected = true;
      projectId = serviceAccount.project_id;
      console.log(`🔥 Connected to Google Firebase Cloud Firestore (Project: ${projectId})!`);
      return true;
    }

    // 2. Check if environment variables are configured
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      if (!getApps().length) {
        initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
          })
        });
      }
      firestoreDb = getFirestore();
      isConnected = true;
      projectId = process.env.FIREBASE_PROJECT_ID;
      console.log(`🔥 Connected to Firebase Firestore for project: ${projectId}!`);
      return true;
    }

    console.log('⚠️ Firebase initialized in standalone mode. Link "serviceAccountKey.json" to enable live Firestore.');
    return false;
  } catch (err) {
    console.warn('⚠️ Firebase init error:', err.message);
    return false;
  }
}

initFirebase();

module.exports = {
  getFirestore() {
    return firestoreDb;
  },
  isFirebaseConnected() {
    return isConnected;
  },
  getProjectId() {
    return projectId;
  },
  
  // Save or update promise in Firestore
  async syncPromiseToFirebase(promise) {
    if (!firestoreDb) return;
    try {
      await firestoreDb.collection('promises').doc(promise.id).set(promise, { merge: true });
    } catch (e) {
      console.error('Firebase promise sync error:', e.message);
    }
  },

  // Save update to Firestore
  async syncUpdateToFirebase(update) {
    if (!firestoreDb) return;
    try {
      await firestoreDb.collection('updates').add({
        ...update,
        syncedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('Firebase update sync error:', e.message);
    }
  },

  // Save site settings to Firestore
  async syncSettingsToFirebase(settings) {
    if (!firestoreDb) return;
    try {
      await firestoreDb.collection('settings').doc('site_meta').set(settings, { merge: true });
    } catch (e) {
      console.error('Firebase settings sync error:', e.message);
    }
  },

  // Save detailed promise updates & setbacks to Firestore
  async syncDetailedUpdatesToFirebase(promiseId, data) {
    if (!firestoreDb) return;
    try {
      await firestoreDb.collection('promise_detailed_updates').doc(promiseId).set({
        promiseId,
        data,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.error('Firebase detailed update sync error:', e.message);
    }
  },

  // Fetch promises from Firestore
  async getPromisesFromFirebase() {
    if (!firestoreDb) return null;
    try {
      const snap = await firestoreDb.collection('promises').get();
      return snap.docs.map(doc => doc.data());
    } catch (e) {
      console.error('Firebase fetch error:', e.message);
      return null;
    }
  }
};
