'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CollabEditor from '../../components/CollabEditor';
import AIChatBot from '../../components/AIChatBot';
import { ClientOnly } from '../../components/ClientOnly';
import { useAuth } from '../../context/AuthContext';
import { useSocket, type RemoteCursor } from '../../hooks/useSocket';
import ThemeToggle from '../../components/ThemeToggle';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const DEFAULT_CODE: Record<string, string> = {
  javascript: '// Welcome to CollabCode!\\nconsole.log("Hello, world!");\\n',
  python: '# Welcome to CollabCode!\\nprint("Hello, world!")\\n',
  java: 'public class Main {\\n  public static void main(String[] args) {\\n    System.out.println("Hello, world!");\\n  }\\n}\\n',
  cpp: '#include <iostream>\\nint main() {\\n  std::cout << "Hello, world!" << std::endl;\\n  return 0;\\n}\\n',
  c: '#include <stdio.h>\\nint main() {\\n  printf("Hello, world!\\\\n");\\n  return 0;\\n}\\n',
};

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export default function RoomPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const router = useRouter();

  const [roomName, setRoomName] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('monochrome-dark');
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [output, setOutput] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [stdinInput, setStdinInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');

  const isRemoteChange = useRef(false);
  const [guestName] = useState(() => `Guest_${Math.floor(Math.random() * 9999)}`);
  const username = user?.username ?? guestName;

  const handleRemoteCode = useCallback((incoming: string) => {
    isRemoteChange.current = true;
    setCode(incoming);
    setTimeout(() => {
      isRemoteChange.current = false;
    }, 0);
  }, []);

  const handleRemoteLanguage = useCallback((lang: string) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang] ?? '');
  }, []);

  const handleRemoteCursor = useCallback((cursor: RemoteCursor) => {
    setRemoteCursors((prev) => {
      const next = prev.filter((c) => c.socketId !== cursor.socketId);
      next.push(cursor);
      return next;
    });
  }, []);

  const handleRemoteLeft = useCallback((socketId: string) => {
    setRemoteCursors((prev) => prev.filter((c) => c.socketId !== socketId));
  }, []);

  const {
    users,
    chatMessages,
    emitCodeChange,
    emitLanguageChange,
    emitCursorMove,
    sendChatMessage,
    socketId,
  } = useSocket({
    slug,
    username,
    onCodeChange: handleRemoteCode,
    onLanguageChange: handleRemoteLanguage,
    onCursorMove: handleRemoteCursor,
    onUserLeft: handleRemoteLeft,
  });

  useEffect(() => {
    fetch(`${API}/api/rooms/${slug}`)
      .then((r) => r.json())
      .then((room) => {
        if (room.error) {
          router.push('/dashboard');
          return;
        }
        setRoomName(room.name);
        const lang = room.language || 'javascript';
        setLanguage(lang);
        // ✅ Restore last saved code; fall back to default template if no code saved yet
        setCode(room.code && room.code.trim() !== '' ? room.code : (DEFAULT_CODE[lang] ?? DEFAULT_CODE.javascript));
      })
      .catch(() => router.push('/dashboard'));
  }, [slug, router]);

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
    setRunning(true);
    setOutputOpen(true);
    setOutput(null);
    try {
      const res = await fetch(`${API}/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, input: stdinInput || undefined }),
      });
      setOutput(await res.json());
    } catch {
      setOutput({ stdout: '', stderr: 'Network error', exitCode: 1 });
    } finally {
      setRunning(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    sendChatMessage(chatInput.trim());
    setChatInput('');
  };

  const toggleAI = () => setAiOpen((o) => !o);
  const toggleChat = () => setChatOpen((o) => !o);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-secondary)',
        overflow: 'hidden',
      }}
    >
      {/* Light Clean Header */}
      <header
        className="glass"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '0 24px',
          height: 56,
          borderBottom: '1px solid var(--bg-border)',
          flexShrink: 0,
          zIndex: 10,
          borderRadius: 0,
          borderTop: 0,
          borderLeft: 0,
          borderRight: 0,
        }}
      >
        <Link
          href="/dashboard"
          style={{
            fontSize: 20,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-primary)',
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: 16,
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            ⬡
          </div>
        </Link>
        <span style={{ width: 1, height: 20, background: 'var(--bg-border)' }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
          {roomName || slug}
        </span>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginRight: 8 }}>
          <ThemeToggle compact />
        </div>

        {/* Live user avatars */}
        <div style={{ display: 'flex', gap: -8, alignItems: 'center', marginRight: 16 }}>
          {users.map((u, i) => (
            <div
              key={u.socketId}
              title={u.username}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: u.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: 'white',
                border: '2px solid white',
                zIndex: users.length - i,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {u.username[0]?.toUpperCase()}
            </div>
          ))}
          {users.length > 0 && (
            <span
              style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 12, fontWeight: 500 }}
            >
              {users.length} online
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={toggleAI}
            className="btn-secondary"
            style={{
              padding: '8px 14px',
              fontSize: 13,
              background: aiOpen ? 'var(--accent-light)' : 'white',
              borderColor: aiOpen ? 'var(--accent-hover)' : 'var(--bg-border)',
              color: aiOpen ? 'var(--accent-hover)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            title="AI Code Assistant"
          >
            🤖 <span style={{ fontWeight: 600 }}>AI Assistant</span>
            {aiOpen && (
              <div
                style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }}
              />
            )}
          </button>

          <button
            className="btn-secondary"
            onClick={toggleChat}
            style={{ padding: '8px 14px', fontSize: 13, display: 'flex', gap: 6 }}
          >
            💬 <span style={{ fontWeight: 600 }}>Chat</span>
            {chatMessages.length > 0 && (
              <span
                style={{
                  background: 'var(--bg-secondary)',
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontSize: 11,
                }}
              >
                {chatMessages.length}
              </span>
            )}
          </button>
          <button
            className="btn-secondary"
            onClick={copyLink}
            style={{ padding: '8px 14px', fontSize: 13, display: 'flex', gap: 6 }}
          >
            🔗 <span style={{ fontWeight: 600 }}>{copied ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </header>

      {/* Main IDE Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 12, gap: 12 }}>
        {/* Editor & Output Column */}
        <div
          style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}
        >
          {/* Code Editor Panel */}
          <div
            className="panel"
            style={{
              flex: outputOpen ? '1 1 65%' : '1 1 100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'flex 0.3s',
            }}
          >
            {/* ✅ FIX 6: Wrap Monaco editor with ClientOnly to prevent hydration mismatches */}
            <ClientOnly
              fallback={
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  Loading editor...
                </div>
              }
            >
              <CollabEditor
                value={code}
                language={language}
                theme={theme}
                onChange={handleLocalCodeChange}
                onLanguageChange={handleLanguageChange}
                onThemeChange={setTheme}
                onRun={runCode}
                running={running}
                remoteCursors={remoteCursors}
                localSocketId={socketId}
                onCursorMove={emitCursorMove}
              />
            </ClientOnly>
          </div>

          {/* Output Panel Sliding up */}
          {outputOpen && (
            <div
              className="panel"
              style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column' }}
            >
              <div className="panel-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>EXECUTION PANEL</span>
                  {output && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontWeight: 600,
                        background: output.exitCode === 0 ? '#dcfce7' : '#fee2e2',
                        color: output.exitCode === 0 ? '#166534' : '#991b1b',
                      }}
                    >
                      Exit {output.exitCode}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setOutputOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: 16,
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Input Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid #2c3038' }}>
                  <div style={{ padding: '8px 16px', background: '#16181b', color: '#e6e6e6', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #2c3038' }}>
                    Standard Input (stdin)
                  </div>
                  <textarea
                    value={stdinInput}
                    onChange={(e) => setStdinInput(e.target.value)}
                    placeholder="Enter multiline input here before clicking Run..."
                    spellCheck={false}
                    style={{
                      flex: 1,
                      background: '#0a0b0d',
                      color: '#e6e6e6',
                      border: 'none',
                      padding: 16,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 13,
                      resize: 'none',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Output Column */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ padding: '8px 16px', background: '#16181b', color: '#e6e6e6', fontSize: 12, fontWeight: 600, borderBottom: '1px solid #2c3038' }}>
                    Standard Output (stdout/stderr)
                  </div>
                  <div
                    style={{
                      flex: 1,
                      overflow: 'auto',
                      padding: 16,
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: 13,
                      lineHeight: 1.6,
                      background: '#0a0b0d',
                      color: '#e6e6e6'
                    }}
                  >
                    {!output && running && (
                      <div
                        style={{
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            border: '2px solid var(--accent)',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                          }}
                        />{' '}
                        Running...
                      </div>
                    )}
                    {output?.stdout && (
                      <pre style={{ color: '#e6e6e6', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {output.stdout}
                      </pre>
                    )}
                    {output?.stderr && (
                      <pre style={{ color: 'var(--error)', whiteSpace: 'pre-wrap', margin: 0 }}>
                        {output.stderr}
                      </pre>
                    )}
                    {output && !output.stdout && !output.stderr && (
                      <span style={{ color: 'var(--text-muted)' }}>(no output)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Panel - Sidebar */}
        {aiOpen && (
          <div
            className="panel"
            style={{ width: 340, display: 'flex', flexDirection: 'column', flexShrink: 0 }}
          >
            <AIChatBot code={code} language={language} onClose={() => setAiOpen(false)} />
          </div>
        )}

        {/* Collaborator Chat Panel - Sidebar */}
        {chatOpen && (
          <div
            className="panel"
            style={{ width: 300, display: 'flex', flexDirection: 'column', flexShrink: 0 }}
          >
            <div className="panel-header">
              <span>Team Chat</span>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                background: '#0a0b0d',
              }}
            >
              {chatMessages.length === 0 && (
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.5 }}>💬</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    No messages yet. Say hi!
                  </p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-hover)' }}>
                      {msg.username}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {new Date(msg.time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      background: '#16181b',
                      padding: '8px 12px',
                      borderRadius: '0 12px 12px 12px',
                      fontSize: 13,
                      color: '#e6e6e6',
                      lineHeight: 1.5,
                      border: '1px solid #2c3038',
                    }}
                  >
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                padding: '12px',
                borderTop: '1px solid var(--bg-border)',
                display: 'flex',
                gap: 8,
                background: 'var(--bg-secondary)',
              }}
            >
              <input
                className="input-field"
                placeholder="Message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                style={{ flex: 1, padding: '8px 12px', fontSize: 13, height: 36 }}
              />
              <button
                className="btn-primary"
                onClick={handleSendChat}
                style={{ padding: '0 16px', height: 36 }}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
