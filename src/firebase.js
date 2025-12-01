import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAOHaflp6c2aohgDL_ToVvGm3hcQeir-KM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "attention-tracker-7f872.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "attention-tracker-7f872",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "attention-tracker-7f872.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "939277055336",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:939277055336:web:19aa25a6f657696c0892dd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-1R60ENTWKE"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Persistence setup
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Persistence activée - Tu resteras connecté');
  })
  .catch((error) => {
    console.error('❌ Erreur persistence:', error);
  });
