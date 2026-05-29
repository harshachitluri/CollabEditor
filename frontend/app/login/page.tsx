'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError('');
    try {
      const res = await fetch(`${API}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Google Login failed');
        return;
      }
      login(data.token, data.user);
      router.push('/dashboard');
    } catch {
      setError('Network error — is the server running?');
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In was unsuccessful. Please try again.');
  };

  return (
    <div
      className="page-root"
      style={{ alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}
    >
      <div className="auth-card fade-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'Outfit, sans-serif',
              fontSize: 22,
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: 10,
            }}
          >
            <div className="cc-logo-icon" style={{ width: 38, height: 38, fontSize: 17 }}>
              ⬡
            </div>
            CollabCode
          </div>
          <p
            style={{
              fontSize: 28,
              fontWeight: 700,
              fontFamily: 'Outfit, sans-serif',
              color: 'var(--text-primary)',
              letterSpacing: '-0.5px',
              marginBottom: 6,
            }}
          >
            Welcome back
          </p>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 400 }}>
            Sign in to your workspace
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
          />

          {error && <div className="error-msg" style={{ width: '100%', textAlign: 'center' }}>⚠ {error}</div>}
        </div>
      </div>

      {/* Subtle bottom quote */}
      <p
        className="fade-up fade-up-3"
        style={{
          marginTop: 40,
          fontSize: 13,
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          textAlign: 'center',
          maxWidth: 420,
          lineHeight: 1.6,
        }}
      >
        &ldquo;Code is the closest thing to a superpower that exists in the real world.&rdquo;
      </p>
    </div>
  );
}
