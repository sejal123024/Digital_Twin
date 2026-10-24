// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBJi6sSs7Zcz4o31wwAo3081sHcF6JzSuY",
  authDomain: "digitaltwin-13cdb.firebaseapp.com",
  projectId: "digitaltwin-13cdb",
  storageBucket: "digitaltwin-13cdb.firebasestorage.app",
  messagingSenderId: "499081942762",
  appId: "1:499081942762:web:67b8636e5c7d861a6e6993",
  measurementId: "G-S55GR9YJX8"
};

// Initialize Firebase App singleton
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db = getFirestore(app);

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics safely (only supported in browser environments)
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn('[Firebase Analytics] Not supported in this environment:', err);
    });
}

/**
 * Sign in with email and password
 */
export async function loginWithEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Register a new user with email, password, and optional display name
 */
export async function registerWithEmail(email, password, displayName) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

/**
 * Sign in or sign up with Google popup
 */
export async function loginWithGoogle() {
  return await signInWithPopup(auth, googleProvider);
}

/**
 * Sign out current authenticated user
 */
export async function logoutUser() {
  return await signOut(auth);
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  return await sendPasswordResetEmail(auth, email);
}

export default app;
