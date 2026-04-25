'use client';
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 48px", borderBottom: "1px solid var(--bg-border)",
        position: "sticky", top: 0, background: "rgba(13,13,13,0.85)", backdropFilter: "blur(12px)",
        zIndex: 100,
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
          <span style={{ color: "var(--accent)" }}>⬡</span> CollabCode
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login"><button className="btn-secondary">Log in</button></Link>
          <Link href="/register"><button className="btn-primary">Get started free</button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "120px 24px 80px" }}>
        <div className="tag" style={{ marginBottom: 20 }}>⚡ Real-time · CRDT · AI-powered</div>
        <h1 style={{ fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
          Code together,<br />
          <span style={{
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>without the conflicts.</span>
        </h1>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
          A collaborative code editor powered by Yjs CRDTs and an AI pair programmer.
          Share a link, start coding — no sign-up required for guests.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register"><button className="btn-primary" style={{ padding: "14px 32px", fontSize: 16 }}>Start coding free →</button></Link>
          <Link href="/login"><button className="btn-secondary" style={{ padding: "14px 32px", fontSize: 16 }}>Sign in</button></Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 120px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
          {[
            { icon: "⚡", title: "Zero-conflict editing", desc: "Built on Yjs CRDTs — the same tech as Figma and Notion. Multiple users, zero merge conflicts." },
            { icon: "🤖", title: "AI pair programmer", desc: "Select any code and instantly get explanations, bug fixes, or generated tests from Claude." },
            { icon: "▶", title: "Run code instantly", desc: "Execute JavaScript, Python, Java, Go, Rust, and 10+ other languages directly in the browser." },
            { icon: "👥", title: "Live cursors", desc: "See exactly where your collaborators are, in real time, with color-coded cursor labels." },
            { icon: "🔗", title: "Shareable rooms", desc: "One link. Share it and anyone can join your session instantly — no sign-up needed." },
            { icon: "🌙", title: "VS Code quality", desc: "Monaco Editor — the same engine powering VS Code, running right in your browser." },
          ].map(f => (
            <div key={f.title} className="card" style={{ transition: "border-color 0.2s", cursor: "default" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--bg-border)")}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--bg-border)", padding: "24px 48px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
        CollabCode · Built with Next.js, Yjs, Monaco, and Claude AI
      </footer>
    </main>
  );
}
