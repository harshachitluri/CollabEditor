'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CollabEditor from '../../components/CollabEditor';
import { useAuth } from '../../context/AuthContext';
import { useSocket, RoomUser, ChatMsg } from '../../hooks/useSocket';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DEFAULT_CODE: Record<string, string> = {
  javascript: '// Welcome to CollabCode!\nconsole.log("Hello, world!");\n',
  typescript: 'const greet = (name: string): string => `Hello, ${name}!`;\nconsole.log(greet("world"));\n',
  python: '# Welcome to CollabCode!\nprint("Hello, world!")\n',
  java: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, world!");\n  }\n}\n',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, world!")\n}\n',
  rust: 'fn main() {\n  println!("Hello, world!");\n}\n',
  cpp: '#include <iostream>\nint main() {\n  std::cout << "Hello, world!" << std::endl;\n  return 0;\n}\n',
};

interface RunResult { stdout: string; stderr: string; exitCode: number; }

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { token, user } = useAuth();
  const router = useRouter();

  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [output, setOutput] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const isRemoteChange = useRef(false);
  const username = user?.username ?? `Guest_${Math.floor(Math.random() * 9999)}`;

  // Handle incoming code from another user
  const handleRemoteCode = useCallback((incoming: string) => {
    isRemoteChange.current = true;
    setCode(incoming);
    setTimeout(() => { isRemoteChange.current = false; }, 0);
  }, []);

  const handleRemoteLanguage = useCallback((lang: string) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] ?? '');
  }, []);

  const { users, chatMessages, emitCodeChange, emitLanguageChange, sendChatMessage } = useSocket({
    slug,
    username,
    onCodeChange: handleRemoteCode,
    onLanguageChange: handleRemoteLanguage,
  });

  // Load room from API
  useEffect(() => {
    fetch(`${API}/api/rooms/${slug}`)
      .then(r => r.json())
      .then(room => {
        if (room.error) { router.push('/dashboard'); return; }
        setRoomName(room.name);
        setLanguage(room.language || 'javascript');
        setCode(DEFAULT_CODE[room.language] ?? DEFAULT_CODE.javascript);
      })
      .catch(() => router.push('/dashboard'));
  }, [slug, router]);

  // Broadcast local code changes (not remote ones)
  const handleLocalCodeChange = (val: string) => {
    setCode(val);
    if (!isRemoteChange.current) emitCodeChange(val);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] ?? '');
    emitLanguageChange(lang);
  };

  const runCode = async () => {
    setRunning(true); setOutputOpen(true); setOutput(null);
    try {
      const res = await fetch(`${API}/api/run`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language }),
      });
      setOutput(await res.json());
    } catch { setOutput({ stdout: '', stderr: 'Network error', exitCode: 1 }); }
    finally { setRunning(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 48, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-border)', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ fontSize: 18, fontWeight: 700 }}>
          <span style={{ color: 'var(--accent)' }}>⬡</span>
        </Link>
        <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontSize: 14, fontWeight: 600 }}>{roomName || slug}</span>

        <div style={{ flex: 1 }} />

        {/* Live user avatars */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {users.map(u => (
            <div key={u.socketId} title={u.username} style={{
              width: 28, height: 28, borderRadius: '50%', background: u.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, border: '2px solid var(--bg-secondary)',
            }}>
              {u.username[0]?.toUpperCase()}
            </div>
          ))}
          {users.length > 0 && (
            <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 4 }}>
              {users.length} online
            </span>
          )}
        </div>

        <button id="chat-btn" className="btn-secondary" onClick={() => setChatOpen(o => !o)} style={{ padding: '6px 12px', fontSize: 13 }}>
          💬 {chatMessages.length > 0 ? chatMessages.length : ''}
        </button>
        <button id="copy-link-btn" className="btn-secondary" onClick={copyLink} style={{ padding: '6px 14px', fontSize: 13 }}>
          {copied ? '✓ Copied!' : '🔗 Share'}
        </button>
      </header>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor column */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: outputOpen ? '1 1 60%' : '1 1 100%', overflow: 'hidden', transition: 'flex 0.2s' }}>
            <CollabEditor
              value={code}
              language={language}
              theme={theme}
              onChange={handleLocalCodeChange}
              onLanguageChange={handleLanguageChange}
              onThemeChange={setTheme}
              onRun={runCode}
              running={running}
            />
          </div>

          {/* Output Panel */}
          {outputOpen && (
            <div style={{ flex: '0 0 200px', borderTop: '1px solid var(--bg-border)', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid var(--bg-border)', gap: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>OUTPUT</span>
                {output && (
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, fontWeight: 600,
                    background: output.exitCode === 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                    color: output.exitCode === 0 ? 'var(--success)' : 'var(--error)',
                  }}>Exit {output.exitCode}</span>
                )}
                <div style={{ flex: 1 }} />
                <button onClick={() => setOutputOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
              </div>
              <div style={{ flex: 1, overflow: 'auto', padding: 12, fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 }}>
                {!output && running && <span style={{ color: 'var(--text-muted)' }}>Running...</span>}
                {output?.stdout && <pre style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{output.stdout}</pre>}
                {output?.stderr && <pre style={{ color: 'var(--error)', whiteSpace: 'pre-wrap' }}>{output.stderr}</pre>}
                {output && !output.stdout && !output.stderr && <span style={{ color: 'var(--text-muted)' }}>(no output)</span>}
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {chatOpen && (
          <div style={{ width: 280, borderLeft: '1px solid var(--bg-border)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--bg-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Chat</span>
              <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {chatMessages.length === 0 && (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 20 }}>No messages yet</p>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{msg.username}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{msg.message}</p>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 12px', borderTop: '1px solid var(--bg-border)', display: 'flex', gap: 8 }}>
              <input
                id="chat-input"
                className="input-field"
                placeholder="Message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13 }}
              />
              <button id="chat-send-btn" className="btn-primary" onClick={handleSendChat} style={{ padding: '8px 12px', fontSize: 13 }}>→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
