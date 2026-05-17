'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  role: 'user' | 'model';
  content: string;
  isStreaming?: boolean;
}

interface Props {
  code: string;
  language: string;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  {
    label: '🐛 Fix bug',
    prompt: 'There seems to be a bug in the code above. Find it and explain the fix.',
  },
  { label: '💡 Explain code', prompt: 'Explain what the code above does, step by step.' },
  { label: '⚡ Optimize', prompt: 'How can I optimize this code for better performance?' },
  { label: '🧪 Write tests', prompt: 'Write unit tests for the code above.' },
  { label: '📝 Add comments', prompt: 'Add clear comments to explain the code above.' },
  { label: '🔄 Refactor', prompt: 'Refactor the code above to be cleaner and more maintainable.' },
];

function renderContent(text: string) {
  // Parse markdown-style code blocks and inline code
  const parts: React.ReactNode[] = [];
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} style={{ whiteSpace: 'pre-wrap' }}>
          {renderInline(text.slice(lastIndex, match.index))}
        </span>
      );
    }
    parts.push(
      <pre
        key={key++}
        style={{
          background: '#f8fafc',
          border: '1px solid var(--bg-border)',
          borderRadius: 8,
          padding: '12px 14px',
          margin: '8px 0',
          overflow: 'auto',
          fontSize: 12.5,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          lineHeight: 1.6,
          color: 'var(--text-primary)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
        }}
      >
        {match[1] && (
          <div
            style={{
              color: 'var(--accent)',
              fontSize: 11,
              marginBottom: 6,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {match[1]}
          </div>
        )}
        {match[2].trim()}
      </pre>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      <span key={key++} style={{ whiteSpace: 'pre-wrap' }}>
        {renderInline(text.slice(lastIndex))}
      </span>
    );
  }

  return parts;
}

function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const inlineCodeRegex = /`([^`]+)`/g;
  let last = 0;
  let m;
  let k = 0;
  while ((m = inlineCodeRegex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={k++}>{text.slice(last, m.index)}</span>);
    parts.push(
      <code
        key={k++}
        style={{
          background: 'var(--accent-light)',
          border: '1px solid var(--bg-border)',
          borderRadius: 4,
          padding: '1px 6px',
          fontSize: '0.9em',
          fontFamily: "'JetBrains Mono', monospace",
          color: 'var(--accent-hover)',
        }}
      >
        {m[1]}
      </code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(<span key={k++}>{text.slice(last)}</span>);
  return parts;
}

export default function AIChatBot({ code, language, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content:
        "Hi! I'm your AI coding assistant 🤖\n\nI can help you debug errors, explain code, optimize performance, and more. Type a question or use the quick actions below.\n\nTip: Click **Share code context** to let me see your current editor code!",
    },
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [codeShared, setCodeShared] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(
    async (userText: string, withCode = false) => {
      if (!userText.trim() || streaming) return;

      const newUserMsg: Message = { role: 'user', content: userText.trim() };
      const updatedMsgs = [...messages, newUserMsg];
      setMessages(updatedMsgs);
      setInput('');
      setStreaming(true);

      const streamingMsg: Message = { role: 'model', content: '', isStreaming: true };
      setMessages((prev) => [...prev, streamingMsg]);

      const apiMessages = updatedMsgs.map((m) => ({ role: m.role, content: m.content }));
      const firstUserIdx = apiMessages.findIndex((m) => m.role === 'user');
      const trimmedMessages = firstUserIdx >= 0 ? apiMessages.slice(firstUserIdx) : apiMessages;

      const body = {
        messages: trimmedMessages,
        ...(withCode || codeShared ? { code, language } : {}),
      };

      abortRef.current = new AbortController();
      let accumulated = '';

      try {
        const res = await fetch(`${API}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) throw new Error('Failed to connect to AI');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') break;
              if (data.startsWith('[ERROR]')) {
                accumulated += `\n\n⚠️ ${data.slice(7)}`;
                break;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  accumulated += parsed.text;
                  setMessages((prev) => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      role: 'model',
                      content: accumulated,
                      isStreaming: true,
                    };
                    return updated;
                  });
                }
              } catch {
                // skip malformed chunks
              }
            }
          }
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
          accumulated += '\n\n_[Response stopped]_';
        } else {
          accumulated =
            '⚠️ Failed to reach AI. Make sure your GEMINI_API_KEY is set in backend `.env`.';
        }
      } finally {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', content: accumulated, isStreaming: false };
          return updated;
        });
        setStreaming(false);
        abortRef.current = null;
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [messages, streaming, code, language, codeShared]
  );

  const handleQuickAction = (prompt: string) => {
    sendMessage(prompt, true);
    setCodeShared(true);
  };

  const handleShareCode = () => {
    setCodeShared(true);
    sendMessage(
      "I've shared my current code with you. Please take a look and let me know if you spot any issues or have any suggestions.",
      true
    );
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'white',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'var(--accent-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: 'var(--accent-hover)',
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
              AI Assistant
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 500,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--success)',
                  animation: 'pulse 2s infinite',
                }}
              />
              Gemini 2.0 Flash
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!codeShared && (
            <button
              onClick={handleShareCode}
              title="Share your current code with the AI"
              className="tag"
              style={{
                cursor: 'pointer',
                background: 'var(--accent-light)',
                color: 'var(--accent-hover)',
                border: 'none',
              }}
            >
              📎 Share code
            </button>
          )}
          {codeShared && (
            <div
              className="tag"
              style={{ background: '#dcfce7', color: '#166534', border: 'none' }}
            >
              ✓ Code shared
            </div>
          )}
          <button
            onClick={onClose}
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
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.role === 'user' ? (
              <div
                style={{
                  background: 'var(--accent)',
                  borderRadius: '12px 12px 2px 12px',
                  padding: '10px 14px',
                  fontSize: 13,
                  color: '#fff',
                  maxWidth: '88%',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {msg.content}
              </div>
            ) : (
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--bg-border)',
                  borderRadius: '2px 12px 12px 12px',
                  padding: '12px 14px',
                  fontSize: 13,
                  color: 'var(--text-primary)',
                  maxWidth: '96%',
                  lineHeight: 1.65,
                  wordBreak: 'break-word',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                {renderContent(msg.content)}
                {msg.isStreaming && (
                  <span
                    style={{
                      display: 'inline-block',
                      width: 8,
                      height: 14,
                      background: 'var(--accent)',
                      marginLeft: 2,
                      borderRadius: 2,
                      animation: 'blink 1s step-end infinite',
                      verticalAlign: 'middle',
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      {messages.length <= 1 && !streaming && (
        <div style={{ padding: '0 14px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => handleQuickAction(a.prompt)}
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--bg-border)',
                borderRadius: 20,
                color: 'var(--text-secondary)',
                fontSize: 12,
                padding: '5px 12px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'var(--bg-border-hover)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'var(--bg-secondary)';
              }}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div
        style={{
          padding: '10px 12px',
          borderTop: '1px solid var(--bg-border)',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            id="ai-chat-input"
            rows={2}
            placeholder="Ask anything about your code..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            disabled={streaming}
            className="input-field"
            style={{
              flex: 1,
              padding: '9px 12px',
              resize: 'none',
              lineHeight: 1.5,
            }}
          />
          {streaming ? (
            <button
              id="ai-stop-btn"
              onClick={handleStop}
              className="btn-secondary"
              style={{
                height: 60,
                flexShrink: 0,
                color: 'var(--error)',
                borderColor: '#fecaca',
                background: '#fef2f2',
              }}
            >
              ⏹
            </button>
          ) : (
            <button
              id="ai-send-btn"
              onClick={() => sendMessage(input)}
              disabled={!input.trim()}
              className="btn-primary"
              style={{ height: 60, flexShrink: 0, opacity: input.trim() ? 1 : 0.5 }}
            >
              ↑
            </button>
          )}
        </div>
        <p
          style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            margin: '6px 0 0',
            textAlign: 'center',
          }}
        >
          Enter to send · Shift+Enter for newline
        </p>
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
