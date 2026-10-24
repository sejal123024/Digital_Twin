import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';

const AuthContext = createContext(null);

const STORAGE_KEY = 'mira_road_digital_twin_user';

// Helper to format Firebase Auth error codes into friendly user messages
export function formatAuthError(error) {
  if (!error) return 'An unknown error occurred.';
  const code = error.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email address. Please register first.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try logging in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled before completion.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a moment and try again.';
    default:
      return error.message || 'Authentication failed. Please try again.';
  }
}

// Convert Firebase User to app user profile structure
function formatUserProfile(firebaseUser, fallback = {}) {
  if (!firebaseUser) return null;
  const email = firebaseUser.email || fallback.email || '';
  const username = 
    firebaseUser.displayName || 
    fallback.username || 
    (email ? email.split('@')[0] : 'Urban Planner');

  return {
    id: firebaseUser.uid || fallback.id || 'usr_' + Date.now().toString(36),
    uid: firebaseUser.uid,
    username,
    displayName: username,
    email,
    photoURL: firebaseUser.photoURL || null,
    role: fallback.role || 'Smart City Analyst',
    loginMethod: firebaseUser.providerData?.[0]?.providerId || fallback.method || 'credentials',
    lastLogin: firebaseUser.metadata?.lastSignInTime || new Date().toISOString()
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to live Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile = formatUserProfile(firebaseUser);
        setUser(profile);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        } catch (e) {
          console.warn('[AuthContext] LocalStorage write error:', e);
        }
      } else {
        // User is signed out from Firebase
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    }, (err) => {
      console.error('[Firebase Auth State Error]:', err);
      setError(formatAuthError(err));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Email & Password Login
  const login = async (emailOrUserData, password) => {
    setError(null);
    try {
      // Direct credential login
      if (typeof emailOrUserData === 'string' && password) {
        const credential = await signInWithEmailAndPassword(auth, emailOrUserData, password);
        const profile = formatUserProfile(credential.user);
        setUser(profile);
        return profile;
      }

      // Legacy object or direct mock payload support
      if (typeof emailOrUserData === 'object' && emailOrUserData !== null) {
        if (emailOrUserData.email && emailOrUserData.password) {
          const credential = await signInWithEmailAndPassword(
            auth, 
            emailOrUserData.email, 
            emailOrUserData.password
          );
          const profile = formatUserProfile(credential.user, emailOrUserData);
          setUser(profile);
          return profile;
        }

        // If it's a pre-authenticated session payload
        const profile = {
          id: emailOrUserData.id || 'usr_' + Date.now().toString(36),
          username: emailOrUserData.username || 'Urban Planner',
          email: emailOrUserData.email || 'planner@miraroad.digitaltwin.gov',
          role: 'Smart City Analyst',
          loginMethod: emailOrUserData.method || 'credentials',
          lastLogin: new Date().toISOString()
        };
        setUser(profile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        return profile;
      }

      throw new Error('Please provide a valid email and password.');
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  // Email & Password Registration
  const register = async (email, password, displayName) => {
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && credential.user) {
        await updateProfile(credential.user, { displayName });
      }
      const profile = formatUserProfile(credential.user, { username: displayName });
      setUser(profile);
      return profile;
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  // Google OAuth Login
  const loginWithGoogle = async () => {
    setError(null);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      const profile = formatUserProfile(credential.user, { role: 'Verified Citizen' });
      setUser(profile);
      return profile;
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  // Sign out current user
  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err) {
      console.warn('[Firebase SignOut Error]:', err);
    } finally {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const friendlyMsg = formatAuthError(err);
      setError(friendlyMsg);
      throw new Error(friendlyMsg);
    }
  };

  const clearError = () => setError(null);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    error,
    clearError,
    login,
    loginWithEmail: login,
    register,
    loginWithGoogle,
    logout,
    resetPassword,
    auth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
