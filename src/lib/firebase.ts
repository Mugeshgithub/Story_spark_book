
import { initializeApp, getApps, getApp, FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore'; // <-- NEW: Import Firestore

const firebaseConfig = {
  apiKey: "AIzaSyCJ_apFs3hwlpY3KvGlkp8Nrfhjmu8AimY",
  authDomain: "story-spark-a2jdn.firebaseapp.com",
  projectId: "story-spark-a2jdn",
  storageBucket: "story-spark-a2jdn.firebasestorage.app",
  messagingSenderId: "84521254330",
  appId: "1:84521254330:web:855420df4ff07141b37183"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth and Storage
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

// Export what's needed.
export { app, auth, storage, db }
