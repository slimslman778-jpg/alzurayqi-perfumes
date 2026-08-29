import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBghQoC0jjssi9qC1AtkjzeN7rnJEK8tF4",
  authDomain: "alzurayqi-perfumes.firebaseapp.com",
  projectId: "alzurayqi-perfumes",
  storageBucket: "alzurayqi-perfumes.firebasestorage.app",
  messagingSenderId: "109121768462",
  appId: "1:109121768462:web:26615089e2dd48a6f7c05f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
