import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                // Dynamically choose the redirect based on the environment
                redirectTo: import.meta.env.DEV 
                ? 'http://localhost:5173/yamabiko-editor/auth/v1/callback' 
                : 'https://qqdifbyigvbctnumzitl.supabase.co/auth/v1/callback',
            },
        });
        if (error) throw error;
    } catch (error: any) {
      setMessage({ text: error.message || 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-body)'
    }}>
      <div className="container" style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>
          {isSignUp ? 'Create Account' : 'Yamabiko Login'}
        </h2>

        {message && (
          <div style={{
            padding: '12px',
            marginBottom: '20px',
            borderRadius: 'var(--radius-md)',
            background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
            color: message.type === 'error' ? 'var(--danger)' : 'var(--success)',
            border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`
          }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleAuth}>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : "Sign in with github"}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
          <span 
            style={{ color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => { setIsSignUp(!isSignUp); setMessage(null); }}
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </span>
        </div>
      </div>
    </div>
  );
};