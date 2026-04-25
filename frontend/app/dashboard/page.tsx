'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Room { id: string; slug: string; name: string; language: string; isPublic: boolean; createdAt: string; }

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRoom, setNewRoom] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) { router.push('/login'); return; }
    fetch(`${API}/api/rooms`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setRooms(Array.isArray(data) ? data : []); setLoading(false); });
  }, [token, router]);

  const createRoom = async () => {
    if (!newRoom.trim()) return;
    setCreating(true);
    const res = await fetch(`${API}/api/rooms`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newRoom }),
    });
    const room = await res.json();
    setRooms(r => [room, ...r]);
    setNewRoom('');
    setCreating(false);
    router.push(`/room/${room.slug}`);
  };

  const deleteRoom = async (slug: string) => {
    await fetch(`${API}/api/rooms/${slug}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setRooms(r => r.filter(rm => rm.slug !== slug));
  };

  const LANG_COLORS: Record<string, string> = {
    javascript: '#f7df1e', typescript: '#3178c6', python: '#3776ab',
    java: '#f89820', cpp: '#00599c', go: '#00add8', rust: '#ce422b',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', borderBottom: '1px solid var(--bg-border)' }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 700 }}>
          <span style={{ color: 'var(--accent)' }}>⬡</span> CollabCode
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>@{user?.username}</span>
          <button className="btn-secondary" style={{ padding: '8px 16px' }} onClick={() => { logout(); router.push('/'); }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Your rooms</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>Create a room and share the link to start collaborating.</p>
        </div>

        {/* Create Room */}
        <div className="card" style={{ marginBottom: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input id="room-name-input" className="input-field" placeholder="Room name, e.g. 'Leetcode Session'"
            value={newRoom} onChange={e => setNewRoom(e.target.value)} style={{ flex: 1, minWidth: 200 }}
            onKeyDown={e => e.key === 'Enter' && createRoom()} />
          <button id="create-room-btn" className="btn-primary" onClick={createRoom} disabled={creating || !newRoom.trim()}>
            {creating ? 'Creating...' : '+ New room'}
          </button>
        </div>

        {/* Room List */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <p>No rooms yet. Create your first one above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rooms.map(room => (
              <div key={room.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: LANG_COLORS[room.language] || '#888', flexShrink: 0,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{room.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {room.language} · {room.isPublic ? 'Public' : 'Private'} · /{room.slug}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/room/${room.slug}`}>
                    <button id={`open-room-${room.slug}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>Open →</button>
                  </Link>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: 13, color: 'var(--error)', borderColor: 'var(--error)' }}
                    onClick={() => deleteRoom(room.slug)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
