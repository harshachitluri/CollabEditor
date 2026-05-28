# CollabEditor — Developer Guide (Big Picture)

Purpose: a single-file primer so your friend can understand the project from scratch and run or extend it.

Contents
- Project overview
- Architecture & components
- Key flows (room lifecycle, sockets, cursors)
- Frontend: pages & important components
- Backend: routes & socket behavior
- Local setup and commands
- Build, test, lint, and deploy
- Troubleshooting and debugging
- Remaining tasks to finish for production

---

## 1) Project overview

CollabEditor is a real-time collaborative code editor using:
- Frontend: Next.js + React + Monaco Editor for code editing.
- Backend: Express + Socket.IO for real-time events and REST endpoints for auth/rooms/run.
- Optional: Prisma for DB migrations (schema in `backend/prisma`).

Primary features:
- Real-time editing (Yjs optional + socket fallbacks)
- Live cursors and presence
- Run code (server-side runner)
- Chat + AI assistant UI

## 2) Architecture & components (big picture)

- `frontend/` (Next.js app)
  - `app/`: Next app routes and pages (home, login, register, dashboard, room/[slug]).
  - `app/components/CollabEditor.tsx`: Monaco wrapper, editor options, remote cursor rendering.
  - `app/hooks/useSocket.ts`: Socket.IO client, emits and listeners for code-change, cursor-move, chat-message, etc.
  - `app/context/ThemeContext.tsx`: theme provider and persistence.
  - `app/globals.css`: design tokens and shared styles.

- `backend/` (Express API + Socket.IO)
  - `src/app.ts`: server bootstrap, CORS, routes, and socket initialization.
  - `src/socket.ts`: room user tracking, join/leave, code-change, yjs-update, language-change, cursor-move, chat-message handlers.
  - `src/routes/*`: REST endpoints for auth, rooms, run (code execution sandbox), ai.

## 3) Key flows

- Room join flow:
  1. Client emits `join-room` with `{ slug, username }`.
  2. Server stores user in `roomUsers` map and emits `room-users` and `user-joined` to the room.

- Code sync:
  - Clients emit `code-change` with `{ slug, code }`.
  - Server forwards `code-change` to others in the room.
  - Alternatively, Yjs CRDT sync is supported via `yjs-update` events.

- Cursor presence:
  - Clients emit `cursor-move` with `{ slug, line, column }`.
  - Server attaches `socketId`, `username`, and `color` and broadcasts `cursor-move` to the room.
  - Frontend renders remote cursors as Monaco decorations with color and a label.

- Chat:
  - Clients send `chat-message` with `{ slug, message, username }` and server broadcasts to room.

## 4) Frontend: important files to read first
- `app/room/[slug]/page.tsx` — room UI orchestration (fetch room meta, wire socket hook, pass props to `CollabEditor`).
- `app/components/CollabEditor.tsx` — editor mounting, theme registration, remote cursor decorations, emits local cursor events.
- `app/hooks/useSocket.ts` — socket connection code, events, and helper emitters.
- `app/context/ThemeContext.tsx` — how theme is persisted and applied.

## 5) Backend: important files to read first
- `src/socket.ts` — how socket events are wired. Look here to understand cursor handling and room user lifecycle.
- `src/routes/*` — authenticate, create/join rooms, run code endpoints.

## 6) Local setup (quick)

1. Install dependencies (from repo root):

```bash
npm --prefix backend install
npm --prefix frontend install
```

2. Backend env (create `backend/.env`):

```
DATABASE_URL=postgres://user:pass@localhost:5432/collab
JWT_SECRET=<generate-a-random-secret>
CLIENT_URL=http://localhost:3000
```

3. Run locally in dev:

```bash
# start backend (auto-reload)
npm --prefix backend run dev

# start frontend
npm --prefix frontend run dev
```

Open `http://localhost:3000` and test flows.

## 7) Production build & run

- Backend build and start:

```bash
npm --prefix backend run build
npm --prefix backend run start
```

- Frontend build and start (Next.js):

```bash
npm --prefix frontend run build
npm --prefix frontend run start
```

If you deploy with Docker, create `Dockerfile`s for each service and a `docker-compose.yml`.

## 8) Tests, lint, format

- Format backend: `npm --prefix backend run format`
- Lint backend: `npm --prefix backend run lint` (ensure dev deps installed)
- Format frontend: `npm --prefix frontend run format`
- Build frontend: `npm --prefix frontend run build`

## 9) Debugging tips

- Editor not loading: confirm `@monaco-editor/react` is dynamically imported (SSR disabled).
- Socket connect errors: confirm `NEXT_PUBLIC_API_URL` points to the running backend and CORS allows origin.
- Cursor missing: ensure backend emits `cursor-move` and frontend `useSocket` receives `onCursorMove` and that `CollabEditor` receives cursor list as prop.

## 10) Security & production hardening

- Remove secrets from source; store them in environment/secret manager.
- Run `npm audit` and address high/critical vulnerabilities.
- Lock dependency versions in `package-lock.json` or use `npm ci` in CI.

## 11) Remaining high-priority tasks (finish works)

These are safe, high-impact items you can finish before the interview:

1. Finish frontend production build and verify artifacts (run `npm --prefix frontend run build`).
2. Run full lint and fix warnings on backend and frontend.
3. Add Dockerfile + docker-compose for local staging.
4. Create a seeded demo account and script for your interview demo.
5. Run `npm audit fix` and review remaining vulnerabilities.

I can finish these for you — tell me which to do first (I recommend finishing the frontend build and creating a demo account).

## 12) Quick demo script for interview (2–3 minutes)

1. Open app, toggle theme to show consistency.
2. Create a room and copy share link.
3. Open same room in two windows and show real-time edits and cursors.
4. Run sample code and show output panel.
5. Show chat or AI assistant quick suggestion.

---

If your friend wants a walkthrough video or a shorter cheat-sheet, I can generate that too.
