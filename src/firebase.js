import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOHaflp6c2aohgDL_ToVvGm3hcQeir-KM",
  authDomain: "attention-tracker-7f872.firebaseapp.com",
  projectId: "attention-tracker-7f872",
  storageBucket: "attention-tracker-7f872.firebasestorage.app",
  messagingSenderId: "939277055336",
  appId: "1:939277055336:web:19aa25a6f657696c0892dd",
  measurementId: "G-1R60ENTWKE"
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
