# CollabEditor — Interview Q&A & Demo Script

Purpose: fast-reference for interview prep — concise answers, demo script, and practice questions your friend can rehearse.

---

## Elevator pitch (30s)
- CollabEditor is a real-time collaborative code editor built with Next.js + Monaco Editor on the frontend and Express + Socket.IO on the backend. It supports live editing, color-coded cursors, chat, and in-browser code execution. CRDT (Yjs) support is present for conflict-free collaboration.

---

## Architecture (big picture)
- Frontend: Next.js app under `frontend/` (pages in `app/`), `CollabEditor` wraps Monaco; `useSocket` manages Socket.IO events.
- Backend: Express API in `backend/` with Socket.IO server in `src/socket.ts`. REST routes for auth/rooms/run and WebSocket events for real-time sync.
- Data: optional Prisma + a relational DB for rooms/users.

Key protocols: Socket.IO for presence/real-time; optional Yjs CRDT messages for robust sync.

---

## Core technical concepts & one-line answers
- How do you sync code between users?
  - We broadcast edits via Socket.IO (or patch Yjs updates) and apply remote updates; Yjs prevents conflicts when enabled.
- How are live cursors implemented?
  - Clients emit `cursor-move` (line/column); the server augments with username/color and broadcasts; frontend renders Monaco decorations for each remote cursor.
- How do you prevent XSS / unsafe code execution?
  - Run user code in isolated sandboxes; validate inputs; use containerization or restricted language runners; never eval user code in the browser/server process.
- How do you handle offline/ reconnect?
  - Socket.IO auto-reconnect; on reconnect we re-join the room and fetch latest document state (or replay Yjs updates).
- How is theme consistency handled?
  - A ThemeProvider persists `data-theme` on `document.documentElement` and maps the app theme to Monaco themes at mount time.

---

## Scaling & Performance (short)
- For many rooms/users: shard Socket.IO across nodes using Redis adapter and scale backend horizontally. Keep Yjs/state in a shared persistence (LevelDB, CRDT-aware store) or store snapshots in DB.
- Reduce client work by debouncing edits, using Yjs binary updates and only broadcasting deltas.

---

## Security checklist (short)
- Use HTTPS and secure cookies. Protect REST endpoints with JWT. Remove secrets from repo and use secret manager. Run `npm audit` and fix high/critical issues. Sandbox code execution in containers with strict resource limits.

---

## Deployment notes
- Build backend (`npm --prefix backend run build`) and start (`npm --prefix backend run start`).
- Build frontend (`npm --prefix frontend run build`) then `next start` or host on Vercel. Use Docker + docker-compose for staging.

---

## Demo script (3–5 minutes)
1. Open the app homepage and toggle theme to show consistent UI.
2. Create or join a room and explain room metadata (slug, language).
3. Open the same room in second window — show real-time typing sync.
4. Move cursors in both windows, show color-coded labels.
5. Change language, run code, show terminal output.
6. Open chat and send a message.

Talking points per step: why Yjs/Socket.IO, how we avoid conflicts, and where to extend (AI assistant, export).

---

## Common pitfalls and short fixes
- Editor doesn’t load (SSR issue): ensure Monaco is dynamically imported with ssr: false. Fix: use dynamic() in Next.
- Cursors not visible: check server emits `cursor-move`; confirm `useSocket` forwards `onCursorMove` and `CollabEditor` renders decorations.
- CORS/socket refuse: verify `NEXT_PUBLIC_API_URL` and backend CORS origin matcher.

---

## Mock interview questions (10) — practice with answers
1) Explain how real-time collaboration works in this app.
  - Short: clients send edits/cursor events via Socket.IO; backend broadcasts to room members; Yjs CRDT used for conflict-free merges when enabled.

2) Why use Monaco Editor?
  - Monaco is the same engine as VS Code — powerful language support, tokens, and configurable themes; it offers a production-quality editing experience.

3) How does Yjs differ from plain socket sync?
  - Yjs is a CRDT library that encodes operations so concurrent edits merge deterministically without a central authority; raw socket sync must serialize or conflict-resolve edits.

4) How would you scale to 10k concurrent users?
  - Use multiple backend instances, Redis adapter for Socket.IO pub/sub, sticky sessions or stateless auth, and offload persistence/snapshots to a shared store.

5) How are cursor labels and colors chosen and kept stable?
  - Server assigns a color from a palette at join; `socketId` is used as key; on disconnect the color is freed or recycled.

6) How do you secure code execution?
  - Execute code inside a container or sandbox with limited CPU/memory/time; validate inputs and sanitize outputs; separate runner service.

7) How do you ensure UX accessibility?
  - Use proper ARIA labels, keyboard focus order, visible focus styles, color contrast checks, semantic markup.

8) How do you handle schema migrations?
  - Use Prisma migrations (`prisma migrate dev` locally, `prisma migrate deploy` in production); keep migration history in VCS.

9) How to debug a production user-reported desync?
  - Check server logs for dropped socket events, inspect client console, compare Yjs snapshots, and replay events if persisted.

10) What would you add next to improve product-market fit?
  - Simple onboarding tour, demo account with sample rooms, export PDF/MD, session recording, and basic monitoring (Sentry/Prometheus).

---

## Quick checklist to run before interview (one-liners)
- `npm --prefix backend run build && npm --prefix backend run start`
- `npm --prefix frontend run build && npm --prefix frontend run start`
- Verify demo account exists and seed data loaded.
- Run through demo script in two browser windows.

---

If you want, I will:
- create a `demo_seed.sql` / seed script and the demo account, and
- finish the frontend build and run the smoke tests, and
- optionally generate a short one-page cheat-sheet your friend can memorize.
CollabEditor - Interview Q&A & Cheat Sheet

Purpose: give concise answers and talking points so your friend can confidently explain the project in interviews.

1) Elevator pitch (30s)
- CollabEditor is a real-time collaborative code editor using Next.js + Monaco on the frontend and Express + Socket.IO on the backend. It supports live cursors, shared editing (Yjs/CRDT-ready), chat, and server-side code execution for quick demos.

2) Architecture (big picture)
- Frontend: Next.js app in `frontend/app` with a `CollabEditor` component that mounts Monaco, wires cursor events and remote decorations, and consumes `useSocket` for real-time messages.
- Backend: Express API in `backend/src` that serves REST routes (`auth`, `rooms`, `run`, `ai`) and a Socket.IO layer that manages rooms, users, and broadcasts events.
- Data: Optional Prisma migrations in `backend/prisma`. Rooms and users can be persisted to a DB for production.

3) Core technical topics & concise answers

- Q: How does real-time editing work?
  A: We broadcast edits over Socket.IO (or Yjs CRDT updates). Each client applies remote changes; Yjs solves convergence/merge conflicts if used. For simple shared text we forward code patches or full text (tradeoffs: simplicity vs. correctness).

- Q: Why use Monaco Editor?
  A: Monaco is the same engine as VS Code, with language modes, autocomplete and a high-quality editing UX. We dynamically import it on the client to avoid SSR issues.

- Q: How are cursors implemented?
  A: Clients emit `cursor-move` with position; server adds username/color and broadcasts. Frontend uses Monaco decorations to render a thin cursor glyph plus a label. We remove decorations on disconnect.

- Q: What is Yjs and why might you use it?
  A: Yjs is a CRDT library for collaborative editing that provides conflict-free data types and reduces the need for operational transforms. Use it when simultaneous edits and offline edits need robust convergence.

- Q: How do you handle permissions and rooms?
  A: Rooms have optional passwords and may be public or private. The backend `rooms` routes enforce auth via JWT; room join events are validated before joining socket rooms.

- Q: How is code executed safely?
  A: Code execution is done in a sandboxed runner on the server (`/api/run`) with language whitelisting, timeouts and resource limits. For production you'd containerize or use a safe execution service.

- Q: How to scale WebSockets?
  A: Use a Socket.IO adapter backed by Redis (pub/sub) to scale across instances and sticky sessions or shared socket state. For CRDTs, use a persistence/awareness layer.

- Q: How to secure this app in production?
  A: Remove secrets from code, enforce HTTPS, use helmet/CORS properly, set JWT expiration and rotation, rate-limit the run API, scan dependencies, and run `npm audit`.

4) Demo script (2-3 minutes)
- Setup: open app in two windows (main + incognito).
1. Show home -> toggle theme (theme persistence explanation).
2. Create a new room; copy share link and open in second window.
3. Type in code in one window; show the other window updating in real time.
4. Move cursors to show color-coded labels and mention the socket `cursor-move` pipeline.
5. Run the code and show output panel. End with a one-sentence note about sandboxing/timeouts.

5) One-line answers for quick recall
- Real-time sync: "Socket.IO forwards updates; Yjs CRDT for conflict-free merge when needed."  
- Cursors: "Client emits position; server broadcasts with username/color; Monaco decorations render label."  
- Scaling sockets: "Use Redis adapter + sticky sessions or horizontal scaling with pub/sub."  
- Editor SSR: "Monaco is client-only - dynamically import with ssr:false."  
- Security: "Env secrets out of repo, rate limit runner, patch deps, use HTTPS & helmet."

6) Common follow-up technical questions + answers

- Q: Why not Operational Transform (OT)?
  A: OT is mature but more complex to implement. CRDTs (like Yjs) provide easier convergence guarantees for many datatypes and offline edits.

- Q: How do you prevent cursor storms or spam events? 
  A: Throttle cursor emit frequency on the client (e.g., 50-100ms) and optionally aggregate small movements server-side.

- Q: How do you store and replay history?
  A: Take snapshots of the document state periodically (CRDT state or text diffs) and store them; allow restore by applying a snapshot.

- Q: How to debug sync issues?
  A: Check network logs for dropped socket events, verify event payloads, and confirm CRDT updates are correctly applied in order. Add sequence numbers for troubleshooting.

7) Operational questions (deploy / infra)

- Preferred deploy: containerize backend and frontend (or use Vercel for Next frontend and a managed Node host for backend). Use Redis for socket adapter and Postgres for persistent data.
- Monitoring: use Sentry for frontend/backend errors, and Prometheus/Grafana for metrics. Add alerts for error rate and runner failures.

8) Mock interview checklist (prep before call)
- Know the demo script by heart (2-3 minutes).  
- Be ready to explain the cursor flow end-to-end.  
- Explain tradeoffs: simple socket-forwarding vs CRDT complexity.  
- Show one security improvement you implemented (e.g., no secrets in repo).  
- Practice 10 quick questions below.

9) 10 practice questions (run through aloud)
1. Explain the app architecture in 60 seconds.  
2. How do you implement live cursors?  
3. Why choose Monaco? Drawbacks?  
4. How would you scale to 10k concurrent users?  
5. How do you secure code execution on the server?  
6. What changes if you replace Socket.IO with WebRTC data channels?  
7. How do you implement undo/redo in a collaborative editor?  
8. How to add access control to rooms?  
9. How would you benchmark editor latency and throughput?  
10. Explain how you'd add an audit log for edits and joins.

10) Quick recovery scripts & commands
- Restart backend: `npm --prefix backend run start` (or `pm2 restart collab-backend`).
- Rebuild frontend: `npm --prefix frontend run build` then `npm --prefix frontend run start`.
- Check socket health: curl backend `/health` and inspect server logs; confirm `io` server is running.

---

If you want, I will:
- Generate a one-page cheat-sheet for printing, and
- Create 10 short flashcards (Q/A) for quick practice.
