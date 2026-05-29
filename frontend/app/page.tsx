'use client';
import Link from 'next/link';
import ThemeToggle from './components/ThemeToggle';

const features = [
  {
    icon: '⚡',
    title: 'Zero-conflict editing',
    desc: 'Built on Yjs CRDTs — the same tech as Figma and Notion. Multiple users, zero merge conflicts.',
  },
  {
    icon: '🤖',
    title: 'AI pair programmer',
    desc: 'Select any code and instantly get explanations, bug fixes, or generated tests from Claude.',
  },
  {
    icon: '▶',
    title: 'Run code instantly',
    desc: 'Execute JavaScript, Python, Java, Go, Rust, and 10+ other languages directly in the browser.',
  },
  {
    icon: '👥',
    title: 'Live cursors',
    desc: 'See exactly where your collaborators are, in real time, with color-coded cursor labels.',
  },
  {
    icon: '🔗',
    title: 'Shareable rooms',
    desc: 'One link. Share it and anyone can join your session instantly — no sign-up needed.',
  },
  {
    icon: '🌙',
    title: 'VS Code quality',
    desc: 'Monaco Editor — the same engine powering VS Code, running right in your browser.',
  },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* ── Navbar ── */}
      <nav className="cc-nav">
        <div className="cc-logo">
          <div className="cc-logo-icon">⬡</div>
          CollabCode
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ThemeToggle compact />
        </div>
        <div className="cc-nav-actions">
          <Link href="/login">
            <button className="btn-ghost">Log in</button>
          </Link>
          <Link href="/register">
            <button className="btn-nav">Get started</button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section
        className="fade-up fade-up-1"
        style={{
          textAlign: 'center',
          padding: '100px 24px 72px',
          maxWidth: 860,
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div className="cc-tag fade-up" style={{ marginBottom: 28, display: 'inline-flex' }}>
          ⚡ Real-time · CRDT · AI-powered
        </div>

        <h1
          className="fade-up fade-up-2"
          style={{
            fontFamily: 'Outfit, Inter, sans-serif',
            fontSize: 'clamp(44px, 6.5vw, 76px)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-2px',
            color: 'var(--text-primary)',
            marginBottom: 28,
          }}
        >
          Code together,
          <br />
          <span style={{ color: 'var(--accent)' }}>without the conflicts.</span>
        </h1>

        <p
          className="fade-up fade-up-3"
          style={{
            fontSize: 18,
            color: 'var(--text-secondary)',
            lineHeight: 1.75,
            maxWidth: 560,
            margin: '0 auto 48px',
            fontWeight: 400,
          }}
        >
          A collaborative code editor powered by Yjs CRDTs and an AI pair programmer. Share a link,
          start coding — beautifully synced, no sign-up required.
        </p>

        <div
          className="fade-up fade-up-4"
          style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/register">
            <button className="btn-primary" style={{ fontSize: 16, padding: '14px 36px' }}>
              Start coding free →
            </button>
          </Link>
          <Link href="/login">
            <button className="btn-secondary" style={{ fontSize: 16, padding: '14px 36px' }}>
              Sign in
            </button>
          </Link>
        </div>
      </section>

      {/* ── Feature Grid ── */}
      <section
        className="fade-up fade-up-5"
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '0 40px 80px',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
          }}
        >
          {features.map((f) => (
            <div
              key={f.title}
              className="cc-card"
              style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              <div className="cc-icon-box">{f.icon}</div>
              <div>
                <h3
                  style={{
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 17,
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: 10,
                    letterSpacing: '-0.2px',
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Inspirational Quote ── */}
      <section className="cc-quote fade-up" style={{ flex: 1 }}>
        <div className="cc-divider" />
        <blockquote>
          &ldquo;Every great developer you know got there by solving problems they were once
          unqualified to solve.&rdquo;
        </blockquote>
        <cite>— Patrick McKenzie</cite>
        <p
          style={{
            marginTop: 32,
            fontSize: 13,
            color: 'var(--text-muted)',
            fontWeight: 500,
            letterSpacing: '0.04em',
          }}
        >
          CollabCode · Build together, grow together.
        </p>
      </section>
    </main>
  );
}
