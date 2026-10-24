import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ArrowLeft, Globe2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { isAuthenticated, loading, login, loginWithGoogle } = useAuth();
  const [iframeLoading, setIframeLoading] = useState(true);
  const iframeRef = useRef(null);
  const navigate = useNavigate();

  // Handle postMessage events from the embedded login frame
  useEffect(() => {
    const handleMessage = async (event) => {
      if (!event || !event.data || typeof event.data !== 'object') return;

      const postResponse = (payload) => {
        try {
          if (event.source && typeof event.source.postMessage === 'function') {
            event.source.postMessage(payload, '*');
          } else if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(payload, '*');
          }
        } catch (e) {
          console.warn('[LoginPage] PostMessage error:', e);
        }
      };

      // 1. Google OAuth Authentication (run in top-level window to avoid iframe popup blocking)
      if (event.data.type === 'FIREBASE_AUTH_GOOGLE') {
        try {
          await loginWithGoogle();
          postResponse({ type: 'FIREBASE_AUTH_SUCCESS' });
          navigate('/dashboard');
        } catch (err) {
          postResponse({
            type: 'FIREBASE_AUTH_ERROR',
            message: err.message || 'Google sign-in failed'
          });
        }
        return;
      }

      // 2. Direct Auth Success Payload
      if (
        event.data.type === 'FIREBASE_AUTH_SUCCESS' ||
        event.data.type === 'authSuccess'
      ) {
        if (event.data.user) {
          login(event.data.user);
        }
        navigate('/dashboard');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [login, loginWithGoogle, navigate]);

  // If already logged in, redirect to Dashboard
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="login-page-wrapper">
      {/* Top Header Navigation */}
      <header className="login-page-topbar">
        <Link to="/" className="login-back-btn" title="Return to Landing Page">
          <ArrowLeft size={18} />
          <span>Back to Digital Twin</span>
        </Link>

        <div className="login-brand-badge">
          <Globe2 size={18} className="text-cyan" />
          <span>MIRA ROAD · DIGITAL TWIN PORTAL</span>
        </div>
      </header>

      {/* Main Login Frame Container */}
      <main className="login-page-content">
        {iframeLoading && (
          <div className="login-page-spinner-wrapper">
            <Loader2 className="explore-modal-spinner" size={40} />
            <p className="font-mono text-cyan-light">Connecting to Firebase Secure Portal...</p>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src="/login/index.html"
          title="Firebase Animated Login and Registration"
          className={`login-page-iframe ${iframeLoading ? 'iframe-hidden' : 'iframe-visible'}`}
          allow="fullscreen; identity-credentials-get"
          onLoad={() => setIframeLoading(false)}
        />
      </main>
    </div>
  );
}
