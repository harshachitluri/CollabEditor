'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }
      login(data.token, data.user);
      router.push('/dashboard');
    } catch {
      setError('Network error — is the server running?');
    } finally {
      setLoading(false);
    }
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="cc-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
            </div>
            <input
              id="password"
              className="cc-input"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="error-msg">⚠ {error}</div>}

          <button
            id="login-btn"
            className="btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '15px', fontSize: 16, marginTop: 4, borderRadius: 12 }}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--bg-border)' }} />
          <span style={{ fontSize: 12, color: '#c4c9d4', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--bg-border)' }} />
        </div>

        {/* Sign up link */}
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}
          >
            Create one free →
          </Link>
        </p>
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
