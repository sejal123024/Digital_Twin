import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ExploreModal({ isOpen, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const iframeRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Listen for authentication messages from the login iframe
  useEffect(() => {
    if (!isOpen) return;

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
          console.warn('[ExploreModal] PostMessage response error:', e);
        }
      };

      // Modal close triggers
      if (event.data.type === 'closeExploreModal' || event.data.type === 'vismeForms:shouldClose') {
        onClose();
        return;
      }

      // 1. Firebase Login with Email & Password
      if (event.data.type === 'FIREBASE_AUTH_LOGIN') {
        try {
          const { email, password } = event.data;
          await login(email, password);
          postResponse({ type: 'FIREBASE_AUTH_SUCCESS' });
          onClose();
          navigate('/dashboard');
        } catch (err) {
          postResponse({ 
            type: 'FIREBASE_AUTH_ERROR', 
            message: err.message || 'Login failed' 
          });
        }
        return;
      }

      // 2. Firebase Registration
      if (event.data.type === 'FIREBASE_AUTH_REGISTER') {
        try {
          const { email, password, username } = event.data;
          await register(email, password, username);
          postResponse({ type: 'FIREBASE_AUTH_SUCCESS' });
          onClose();
          navigate('/dashboard');
        } catch (err) {
          postResponse({ 
            type: 'FIREBASE_AUTH_ERROR', 
            message: err.message || 'Registration failed' 
          });
        }
        return;
      }

      // 3. Firebase Google Authentication
      if (event.data.type === 'FIREBASE_AUTH_GOOGLE') {
        try {
          await loginWithGoogle();
          postResponse({ type: 'FIREBASE_AUTH_SUCCESS' });
          onClose();
          navigate('/dashboard');
        } catch (err) {
          postResponse({ 
            type: 'FIREBASE_AUTH_ERROR', 
            message: err.message || 'Google authentication failed' 
          });
        }
        return;
      }

      // 4. Auth success payload synchronization
      if (event.data.type === 'authSuccess' || (event.data.type === 'FIREBASE_AUTH_SUCCESS' && event.data.user)) {
        login(event.data.user || {});
        onClose();
        navigate('/dashboard');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, onClose, login, register, loginWithGoogle, navigate]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="explore-fullscreen-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Full Desktop Animated Login & Registration"
    >
      {/* Floating Top Controls */}
      <div className="explore-fullscreen-topbar">
        <button 
          onClick={onClose}
          className="explore-fullscreen-back-btn"
          aria-label="Back to Digital Twin"
        >
          <ArrowLeft size={18} />
          <span>Back to Digital Twin</span>
        </button>

        <button 
          onClick={onClose}
          className="explore-fullscreen-close-circle"
          aria-label="Close"
          title="Close (Esc)"
        >
          <X size={20} />
        </button>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="explore-fullscreen-loading">
          <Loader2 className="explore-modal-spinner" size={36} />
          <p className="explore-modal-loading-text font-mono">Loading Login &amp; Registration...</p>
        </div>
      )}

      {/* Full Desktop Iframe of Login Form Animation */}
      <iframe
        ref={iframeRef}
        src="/login/index.html"
        title="Animated Login and Signup Form"
        className={`explore-fullscreen-iframe ${isLoading ? 'iframe-hidden' : 'iframe-visible'}`}
        allow="fullscreen; identity-credentials-get"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
