import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#070b14',
        color: '#f0f4fc',
        gap: '16px',
        fontFamily: 'Inter, sans-serif'
      }}>
        <Loader2 
          size={42} 
          style={{ 
            color: '#00d4ff', 
            animation: 'spin 1s linear infinite' 
          }} 
        />
        <div style={{
          fontSize: '0.9rem',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#94a3b8',
          fontFamily: 'JetBrains Mono, monospace'
        }}>
          Verifying Digital Twin Credentials...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated requests back to the landing page
    return <Navigate to="/" replace />;
  }

  return children;
}
