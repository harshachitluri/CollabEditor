'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }
      login(data.token, data.user);
      router.push('/dashboard');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: 24,
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
            <span style={{ color: 'var(--accent)' }}>⬡</span> CollabCode
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Create your free account</p>
        </div>
        <div className="card">
          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {[
              {
                id: 'email',
                label: 'Email',
                type: 'email',
                placeholder: 'you@example.com',
                key: 'email',
              },
              {
                id: 'username',
                label: 'Username',
                type: 'text',
                placeholder: 'coolcoder42',
                key: 'username',
              },
              {
                id: 'password',
                label: 'Password',
                type: 'password',
                placeholder: '••••••••',
                key: 'password',
              },
            ].map((f) => (
              <div key={f.key}>
                <label
                  style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  {f.label}
                </label>
                <input
                  id={f.id}
                  className="input-field"
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={set(f.key)}
                  required
                />
              </div>
            ))}
            {error && <p style={{ color: 'var(--error)', fontSize: 13 }}>{error}</p>}
            <button
              id="register-btn"
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '12px', marginTop: 4 }}
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>
        </div>
        <p
          style={{
            textAlign: 'center',
            marginTop: 20,
            fontSize: 14,
            color: 'var(--text-secondary)',
          }}
        >
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
