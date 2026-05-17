'use client';

interface NavbarProps {
  title?: string;
  user?: { username: string };
  onLogout?: () => void;
}

export function Navbar({ title = 'CollabCode', user, onLogout }: NavbarProps) {
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 40px',
        borderBottom: '1px solid var(--bg-border)',
        background: 'var(--bg-primary)',
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700 }}>
        <span style={{ color: 'var(--accent)' }}>⬡</span> {title}
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>@{user.username}</span>
          {onLogout && (
            <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={onLogout}>
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
