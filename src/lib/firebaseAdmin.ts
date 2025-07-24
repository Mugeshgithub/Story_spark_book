
// This file is part of the old Firestore setup.
// With the switch to local storage, server-side admin features are no longer used.
// The file is kept for potential future re-integration but its logic is effectively disabled.
/*
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require('@/credentiels/story-spark-a2jdn-firebase-adminsdk-fbsvc-eb7b23caff.json')),
      databaseURL: `https://story-spark-a2jdn.firebaseio.com`
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
*/
export {}; // Ensure this file is treated as a module.
