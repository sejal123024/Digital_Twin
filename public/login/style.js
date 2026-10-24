// ============================================================
// Mira Road Digital Twin - Firebase Authentication Controller
// ============================================================

import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signInWithPopup, 
  GoogleAuthProvider,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";

// Web app's Firebase configuration
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

// Configure Google Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Analytics safely
export let analytics = null;
if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) analytics = getAnalytics(app);
    })
    .catch((err) => {
      console.warn('[Firebase Analytics]', err);
    });
}

// Local Storage Session Key
const STORAGE_KEY = 'mira_road_digital_twin_user';

// UI Element Selectors
const authWrapper = document.querySelector('.auth-wrapper');
const loginTrigger = document.querySelector('.login-trigger');
const registerTrigger = document.querySelector('.register-trigger');
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const googleSigninBtn = document.getElementById('google-signin-btn');
const googleSignupBtn = document.getElementById('google-signup-btn');

// ============================================================
// Panel Transition Controls
// ============================================================
if (registerTrigger) {
  registerTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    hideAlert('signin');
    hideAlert('signup');
    authWrapper?.classList.add('toggled');
  });
}

if (loginTrigger) {
  loginTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    hideAlert('signin');
    hideAlert('signup');
    authWrapper?.classList.remove('toggled');
  });
}

// ============================================================
// Notification and Alert Helpers
// ============================================================
function showAlert(panel, message, isSuccess = false) {
  const alertEl = document.getElementById(`${panel}-alert`);
  if (!alertEl) return;
  alertEl.textContent = message;
  alertEl.className = `auth-alert slide-element visible ${isSuccess ? 'success' : ''}`;
}

function hideAlert(panel) {
  const alertEl = document.getElementById(`${panel}-alert`);
  if (!alertEl) return;
  alertEl.textContent = '';
  alertEl.className = 'auth-alert slide-element';
}

function setButtonLoading(btnId, isLoading, originalText) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = isLoading;
  const textSpan = btn.querySelector('.btn-text, .google-btn-text');
  if (isLoading) {
    if (textSpan) textSpan.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Processing...';
  } else {
    if (textSpan) textSpan.innerHTML = originalText;
  }
}

// Format Firebase Auth errors into friendly messages
function formatAuthError(error) {
  if (!error) return 'An error occurred during authentication.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please click "Sign Up" to register.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/popup-blocked':
      return 'Google popup was blocked by browser. Please allow popups.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a few moments.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

// Map Firebase User to application profile
function formatUserProfile(firebaseUser, fallback = {}) {
  const email = firebaseUser?.email || fallback.email || '';
  const username = 
    firebaseUser?.displayName || 
    fallback.username || 
    (email ? email.split('@')[0] : 'Urban Planner');

  return {
    id: firebaseUser?.uid || 'usr_' + Date.now().toString(36),
    uid: firebaseUser?.uid || null,
    username,
    displayName: username,
    email,
    photoURL: firebaseUser?.photoURL || null,
    role: fallback.role || 'Smart City Analyst',
    loginMethod: firebaseUser?.providerData?.[0]?.providerId || fallback.method || 'credentials',
    lastLogin: firebaseUser?.metadata?.lastSignInTime || new Date().toISOString()
  };
}

// Dispatch authentication success to parent React app and navigate
function handleAuthSuccess(profile) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn('[Storage Error]', err);
  }

  // If inside an iframe (like ExploreModal in React app)
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({
        type: 'FIREBASE_AUTH_SUCCESS',
        user: profile
      }, '*');
      window.parent.postMessage({
        type: 'authSuccess',
        user: profile
      }, '*');
    } catch (e) {
      console.warn('[PostMessage Error]', e);
    }
  } else {
    // Standalone access: navigate directly to dashboard
    window.location.href = '/dashboard';
  }
}

// ============================================================
// 1. Email & Password Sign In
// ============================================================
if (signinForm) {
  signinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('signin');

    const emailInput = document.getElementById('signin-email');
    const passwordInput = document.getElementById('signin-password');
    const email = emailInput?.value?.trim() || '';
    const password = passwordInput?.value || '';

    if (!email || !password) {
      showAlert('signin', 'Please enter your email and password.');
      return;
    }

    setButtonLoading('signin-submit-btn', true, 'Login');

    try {
      // Direct Firebase Auth call
      const credential = await signInWithEmailAndPassword(auth, email, password);
      showAlert('signin', 'Login successful! Entering Digital Twin...', true);
      const profile = formatUserProfile(credential.user);
      
      setTimeout(() => {
        handleAuthSuccess(profile);
      }, 350);
    } catch (err) {
      console.error('[Sign In Error]:', err);
      showAlert('signin', formatAuthError(err));
      setButtonLoading('signin-submit-btn', false, 'Login');
    }
  });
}

// ============================================================
// 2. Email & Password Registration
// ============================================================
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert('signup');

    const usernameInput = document.getElementById('signup-username');
    const emailInput = document.getElementById('signup-email');
    const passwordInput = document.getElementById('signup-password');

    const username = usernameInput?.value?.trim() || '';
    const email = emailInput?.value?.trim() || '';
    const password = passwordInput?.value || '';

    if (!email || !password) {
      showAlert('signup', 'Please enter your email address and a password.');
      return;
    }

    if (password.length < 6) {
      showAlert('signup', 'Password must be at least 6 characters long.');
      return;
    }

    setButtonLoading('signup-submit-btn', true, 'Register');

    try {
      // Direct Firebase Registration call
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name if provided
      if (username && credential.user) {
        try {
          await updateProfile(credential.user, { displayName: username });
        } catch (nameErr) {
          console.warn('[Profile Name Error]:', nameErr);
        }
      }

      showAlert('signup', 'Account created successfully! Entering Digital Twin...', true);
      const profile = formatUserProfile(credential.user, { username });

      setTimeout(() => {
        handleAuthSuccess(profile);
      }, 350);
    } catch (err) {
      console.error('[Sign Up Error]:', err);
      showAlert('signup', formatAuthError(err));
      setButtonLoading('signup-submit-btn', false, 'Register');
    }
  });
}

// ============================================================
// 3. Google OAuth Authentication
// ============================================================
async function handleGoogleAuth(panel) {
  hideAlert(panel);
  const btnId = panel === 'signin' ? 'google-signin-btn' : 'google-signup-btn';
  const defaultText = panel === 'signin' ? 'Sign in with Google' : 'Sign up with Google';
  setButtonLoading(btnId, true, defaultText);

  // If inside an iframe, delegate to the parent React window to avoid browser popup blocks
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({ type: 'FIREBASE_AUTH_GOOGLE' }, '*');
      // Set safety timeout to re-enable button if parent fails
      setTimeout(() => {
        setButtonLoading(btnId, false, defaultText);
      }, 7000);
      return;
    } catch (e) {
      console.warn('[Google PostMessage]', e);
    }
  }

  // Standalone mode: open Google popup directly
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    showAlert(panel, 'Google authorization successful! Entering Digital Twin...', true);
    const profile = formatUserProfile(credential.user, { role: 'Verified Citizen' });
    
    setTimeout(() => {
      handleAuthSuccess(profile);
    }, 350);
  } catch (err) {
    console.error('[Google Auth Error]:', err);
    showAlert(panel, formatAuthError(err));
    setButtonLoading(btnId, false, defaultText);
  }
}

if (googleSigninBtn) {
  googleSigninBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleGoogleAuth('signin');
  });
}

if (googleSignupBtn) {
  googleSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    handleGoogleAuth('signup');
  });
}

// ============================================================
// 4. Listen for Responses from Parent Window (ExploreModal)
// ============================================================
window.addEventListener('message', (event) => {
  if (!event || !event.data || typeof event.data !== 'object') return;

  if (event.data.type === 'FIREBASE_AUTH_SUCCESS') {
    showAlert('signin', 'Authorized! Entering Digital Twin...', true);
    showAlert('signup', 'Authorized! Entering Digital Twin...', true);
  } else if (event.data.type === 'FIREBASE_AUTH_ERROR') {
    const errorMsg = event.data.message || 'Authentication failed. Please try again.';
    showAlert('signin', errorMsg);
    showAlert('signup', errorMsg);
    setButtonLoading('signin-submit-btn', false, 'Login');
    setButtonLoading('signup-submit-btn', false, 'Register');
    setButtonLoading('google-signin-btn', false, 'Sign in with Google');
    setButtonLoading('google-signup-btn', false, 'Sign up with Google');
  }
});

// Auto-sync existing Firebase session if detected
onAuthStateChanged(auth, (firebaseUser) => {
  if (firebaseUser) {
    const profile = formatUserProfile(firebaseUser);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {}
  }
});