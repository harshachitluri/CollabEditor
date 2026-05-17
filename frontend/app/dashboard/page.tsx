'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Room {
  id: string;
  slug: string;
  name: string;
  language: string;
  isPublic: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [newRoom, setNewRoom] = useState('');
  const [newRoomPassword, setNewRoomPassword] = useState('');
  const [showPasswordField, setShowPasswordField] = useState(false);
  const [creating, setCreating] = useState(false);

  const [joinId, setJoinId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetch(`${API}/api/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        setRooms(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [token, router]);

  const createRoom = async () => {
    if (!newRoom.trim()) return;
    setCreating(true);
    const res = await fetch(`${API}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: newRoom,
        password: showPasswordField && newRoomPassword.trim() ? newRoomPassword.trim() : undefined,
      }),
    });
    const room = await res.json();
    setRooms((r) => [room, ...r]);
    setNewRoom('');
    setNewRoomPassword('');
    setShowPasswordField(false);
    setCreating(false);
    router.push(`/room/${room.slug}`);
  };

  const joinRoom = async () => {
    if (!joinId.trim()) return;
    setJoining(true);
    setJoinError('');
    try {
      const res = await fetch(`${API}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: joinId.trim(), password: joinPassword || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setJoinError(data.error || 'Failed to join room');
        setJoining(false);
        return;
      }
      router.push(`/room/${data.slug}`);
    } catch {
      setJoinError('Network error — is the server running?');
      setJoining(false);
    }
  };

  const deleteRoom = async (slug: string) => {
    await fetch(`${API}/api/rooms/${slug}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setRooms((r) => r.filter((rm) => rm.slug !== slug));
  };

  const copyRoomLink = async (slug: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/room/${slug}`);
  };

  const LANG_COLORS: Record<string, string> = {
    javascript: '#eab308',
    typescript: '#3b82f6',
    python: '#0ea5e9',
    c: '#6b7280',
    java: '#f97316',
    cpp: '#0284c7',
    go: '#06b6d4',
    rust: '#ea580c',
  };

  return (
    <div className="page-root animate-fade-in">

      {/* Navbar */}
      <nav className="cc-nav">
        <Link href="/" className="cc-logo">
          <div className="cc-logo-icon">⬡</div>
          CollabCode
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(255,255,255,0.7)', padding: '6px 14px 6px 8px',
            borderRadius: 100, border: '1px solid #e4e7ec',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#f1f5f9', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#374151',
              border: '1px solid #e4e7ec',
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{user?.username}</span>
          </div>
          <button
            className="btn-ghost"
            onClick={() => { logout(); router.push('/'); }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, width: '100%', maxWidth: 1200, margin: '0 auto', padding: '60px 40px' }}>

        {/* Header */}
        <div className="fade-up" style={{ marginBottom: 52, textAlign: 'center' }}>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(32px, 4vw, 48px)',
            fontWeight: 800, letterSpacing: '-1px',
            color: '#111827', marginBottom: 12,
          }}>
            Your Workspace
          </h1>
          <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto', fontWeight: 400 }}>
            Create a new collaborative session or join an existing room to start building in real-time.
          </p>
        </div>

        {/* Action panels */}
        <div
          className="fade-up fade-up-2"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginBottom: 56 }}
        >
          {/* Create Room */}
          <div className="panel-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="cc-icon-box">✨</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 3 }}>Create Session</h3>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Start a new room instantly</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Project name</label>
              <input
                className="cc-input"
                placeholder="e.g. React UI Fixes, API Debug..."
                value={newRoom}
                onChange={(e) => setNewRoom(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !showPasswordField && createRoom()}
              />
            </div>

            <button
              onClick={() => setShowPasswordField((p) => !p)}
              className="btn-ghost"
              style={{ alignSelf: 'flex-start', fontSize: 13, padding: '6px 10px' }}
            >
              {showPasswordField ? '🔒 Password protected' : '🔓 Add password protection'}
            </button>

            {showPasswordField && (
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  className="cc-input"
                  type="password"
                  placeholder="Enter a secret password"
                  value={newRoomPassword}
                  onChange={(e) => setNewRoomPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createRoom()}
                  autoFocus
                />
              </div>
            )}

            <button
              className="btn-primary"
              onClick={createRoom}
              disabled={creating || !newRoom.trim()}
              style={{ width: '100%', padding: '15px', fontSize: 15 }}
            >
              {creating ? 'Creating...' : 'Create & Join →'}
            </button>
          </div>

          {/* Join Room */}
          <div className="panel-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="cc-icon-box">🔑</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 3 }}>Join Session</h3>
                <p style={{ fontSize: 13, color: '#9ca3af' }}>Enter with a Room ID</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Room ID</label>
              <input
                className="cc-input"
                placeholder="e.g. abc12345"
                value={joinId}
                onChange={(e) => { setJoinId(e.target.value); setJoinError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password (if required)</label>
              <input
                className="cc-input"
                type="password"
                placeholder="Leave blank if public"
                value={joinPassword}
                onChange={(e) => { setJoinPassword(e.target.value); setJoinError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
              />
            </div>

            {joinError && <div className="error-msg">⚠ {joinError}</div>}

            <button
              className="btn-secondary"
              onClick={joinRoom}
              disabled={joining || !joinId.trim()}
              style={{ width: '100%', padding: '15px', fontSize: 15 }}
            >
              {joining ? 'Joining...' : 'Join Room →'}
            </button>
          </div>
        </div>

        {/* Room list */}
        <div className="fade-up fade-up-3">
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 20,
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.3px' }}>
              Recent Rooms
            </h2>
            <span className="badge">{rooms.length} Active</span>
          </div>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
              <div className="spinner" style={{
                width: 32, height: 32,
                border: '3px solid #e4e7ec',
                borderTopColor: '#2563eb',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }} />
            </div>
          ) : rooms.length === 0 ? (
            <div className="cc-card" style={{
              textAlign: 'center', padding: '72px 32px',
              borderStyle: 'dashed', background: 'rgba(255,255,255,0.5)',
              boxShadow: 'none',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>✨</div>
              <h3 style={{ fontSize: 17, fontWeight: 600, color: '#374151', marginBottom: 8 }}>A blank canvas</h3>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>Create a room above to start crafting elegant code.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {rooms.map((room) => (
                <div key={room.id} className="room-row">
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: '#f8fafc', border: '1px solid #e4e7ec',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: LANG_COLORS[room.language] || '#9ca3af',
                    }} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{room.name}</span>
                      {!room.isPublic && <span className="badge">Private</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#9ca3af' }}>
                      <span>ID: <code className="code-chip">{room.slug}</code></span>
                      <span>·</span>
                      <span style={{ textTransform: 'capitalize' }}>{room.language}</span>
                      <span>·</span>
                      <span>{new Date(room.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <button
                      className="btn-ghost"
                      style={{ padding: '8px 10px', fontSize: 16 }}
                      onClick={() => copyRoomLink(room.slug)}
                      title="Copy room link"
                    >🔗</button>
                    <Link href={`/room/${room.slug}`}>
                      <button className="btn-enter">Enter →</button>
                    </Link>
                    <button className="btn-danger" onClick={() => deleteRoom(room.slug)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quote */}
        <div className="cc-quote fade-up fade-up-4" style={{ paddingTop: 80 }}>
          <div className="cc-quote-divider" />
          <blockquote>
            "Every great developer you know got there by solving problems they were once unqualified to solve."
          </blockquote>
          <cite>— Patrick McKenzie</cite>
        </div>

      </main>
    </div>
  );
}

