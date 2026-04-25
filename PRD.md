# CollabCode — Enterprise Product Requirements Document

**Version:** 1.0  
**Date:** 2026-03-25  
**Status:** Draft — Awaiting Claude Instruction File  

---

## 1. Executive Summary

**CollabCode** is a real-time collaborative code editor with AI-powered assistance, built for developers who want a Google Docs-like coding experience — complete with live cursors, conflict-free multi-user editing, multi-language execution, and an AI pair programmer that streams responses in real time.

This is not a clone. It is a genuinely deployable product that targets:
- CS students doing pair programming
- Interview prep (live coding with a peer or interviewer)
- Hackathon teams writing code together remotely
- Developers who want instant AI code review without leaving their editor

---

## 2. Problem Statement

| Pain Point | Current Solution | Gap |
|---|---|---|
| Real-time collaborative coding | Google Docs (not code-aware) | No syntax highlighting, execution, or language awareness |
| AI code assistance | ChatGPT tab-switching | Context is lost; no inline streaming; not collaborative |
| Interview simulation | CoderPad ($$$) | Expensive; no AI; no real CRDT; only for companies |
| Code execution in browser | Replit (heavy) | Slow startup, overkill for quick sessions |

**CollabCode** closes this gap: lightweight, fast, shareable rooms, real CRDTs, and a built-in AI sidebar — all free and open-source.

---

## 3. Goals & Non-Goals

### Goals
- ✅ Real-time multi-user Monaco editor with CRDT (zero conflicts)
- ✅ Live user cursors with names and colors
- ✅ Multi-language code execution (15+ languages)
- ✅ AI sidebar: Explain / Fix / Generate Tests (streaming SSE)
- ✅ Shareable room links (`/room/:id`)
- ✅ User authentication (JWT)
- ✅ Session persistence (rejoin a room and see existing code)
- ✅ Deploy-ready: Vercel (frontend) + Railway (backend)

### Non-Goals (v1)
- ❌ File system / multi-file editor (v2)
- ❌ Docker sandboxing (v2 — Piston API for v1)
- ❌ Voice/video (v2)
- ❌ Git integration (v2)
- ❌ Paid plans / billing

---

## 4. User Personas

### Persona 1 — "The CS Student" (Primary)
- Age: 19–23, CS undergrad
- Needs: Share a link with a classmate and code together right now
- Frustration: CoderPad requires company accounts; Google Docs has no syntax highlighting

### Persona 2 — "The Interview Candidate"
- Age: 22–28, job-hunting
- Needs: Practice live coding with a friend who plays interviewer
- Frustration: Nothing free simulates the real thing with real code execution

### Persona 3 — "The Hackathon Coder"
- Age: 20–30, team of 3–4
- Needs: Everyone in the same editor, same code, no merge conflicts
- Frustration: Git is too slow for real-time; VSCode LiveShare needs an extension

---

## 5. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | Next.js 14 (App Router) | SSR, routing, React — covers 3 birds |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | VS Code-quality editor in browser |
| **CRDT Engine** | Yjs + y-websocket + y-monaco | Conflict-free collaborative editing |
| **Real-time Transport** | Socket.IO (awareness) + y-websocket (Yjs) | Socket.IO for presence; Yjs handles editor sync |
| **Backend** | Express.js + Node.js | Familiar MERN backend, minimal change |
| **WebSocket Server** | y-websocket (standalone) | Runs as separate process, handles Yjs rooms |
| **Database** | PostgreSQL + Prisma ORM | Users, rooms, session metadata |
| **Auth** | JWT (access + refresh tokens) | Stateless, works with any client |
| **Code Execution** | Piston API (free, 50+ languages) | No Docker setup for v1 |
| **AI Integration** | Anthropic Claude API (streaming SSE) | Best code reasoning; streams tokens |
| **Styling** | Tailwind CSS + shadcn/ui | Fast, consistent, production quality |
| **Deployment — FE** | Vercel | Next.js native, free tier |
| **Deployment — BE** | Railway | Persistent process for Socket.IO + Yjs |
| **Deployment — DB** | Railway PostgreSQL | Co-located with backend, free tier |

---

## 6. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js)                     │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │   Monaco    │  │  AI Sidebar  │  │  Room/Auth UI │  │
│  │  Editor     │  │  (SSE stream)│  │  (Next Router)│  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                   │          │
│    Yjs Doc           fetch /api/ai       Socket.IO      │
│         │                │               (presence)     │
└─────────┼────────────────┼───────────────────┼──────────┘
          │                │                   │
          ▼                ▼                   ▼
  ┌───────────────┐  ┌──────────────┐  ┌──────────────────┐
  │  y-websocket  │  │  Express API │  │   Socket.IO      │
  │  Server       │  │  /api/ai     │  │   Server         │
  │  (Yjs rooms)  │  │  /api/run    │  │   (rooms,        │
  │               │  │  /api/auth   │  │    cursors,      │
  │               │  │              │  │    presence)     │
  └───────────────┘  └──────┬───────┘  └──────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
               PostgreSQL         Piston API
               (Prisma)           (code exec)
                    │
               Claude API
               (AI, SSE)
```

---

## 7. Feature Specifications

### 7.1 Authentication

**7.1.1 Sign Up / Log In**
- Email + password
- JWT access token (15m) + refresh token (7d) stored in httpOnly cookie
- `/api/auth/register` — POST
- `/api/auth/login` — POST
- `/api/auth/refresh` — POST
- `/api/auth/logout` — POST

**7.1.2 Guest Mode**
- Users can join a room as a guest (no account required)
- They see a random display name like "Guest_4291"
- Guests cannot create rooms (must register)

---

### 7.2 Room Management

**7.2.1 Room Creation**
- Authenticated users can create a room
- Room gets a UUID slug: `/room/abc12345`
- Room settings: name, language default, public/private
- DB table: `rooms { id, slug, name, owner_id, language, created_at }`

**7.2.2 Room Joining**
- Anyone with the link can join (public rooms)
- Private rooms require a 6-digit PIN
- Room UI shows active users in the top bar (like Figma)

**7.2.3 Room Persistence**
- Yjs document state is persisted via `y-leveldb` on the y-websocket server
- On rejoin, the full document is restored
- DB table: `sessions { id, room_id, user_id, joined_at, left_at }`

---

### 7.3 Collaborative Editor (Core Feature)

**7.3.1 Monaco Editor**
- Full VS Code Monaco editor rendered in browser
- Language switching dropdown (JS, TS, Python, Java, C++, Go, Rust, etc.)
- Theme switching (VS Dark, Dracula, Monokai)
- Font size control

**7.3.2 Yjs CRDT Sync**
- `Y.Doc` created per room
- `y-monaco` binding connects Monaco model to Yjs Text type
- `y-websocket` provider connects to the WS server
- All operations are CRDT-merged — zero conflicts, mathematically guaranteed

**7.3.3 Live Cursors & Awareness**
- Each user has a random color assigned on join
- Yjs Awareness API broadcasts cursor position + selection + username
- Cursor labels render in Monaco using decorations API
- User list in top bar shows avatars with matching colors

---

### 7.4 Code Execution

**7.4.1 Run Button**
- Large "Run ▶" button in the top bar
- Sends current editor content to Express route `POST /api/run`
- Backend calls Piston API with `{ language, version, files: [{ content }] }`
- Returns stdout, stderr, exit code
- Output shown in a terminal-style panel below the editor

**7.4.2 Supported Languages (Piston API)**
- JavaScript, TypeScript, Python, Java, C, C++, Go, Rust, Ruby, PHP, Kotlin, Swift, C#, Haskell, Lua

**7.4.3 Execution Limits**
- 10-second timeout enforced by Piston
- Max 65KB input code

---

### 7.5 AI Sidebar (Pair Programmer)

**7.5.1 Activation**
- Sidebar opens when user selects code in Monaco + clicks AI button (or Cmd+Shift+A)
- If no code selected, sends entire editor content

**7.5.2 Actions**
| Button | Prompt Template |
|---|---|
| **Explain** | "Explain this code step by step in simple terms:" |
| **Fix** | "Identify and fix bugs in this code. Return only the corrected code with a brief explanation:" |
| **Generate Tests** | "Write comprehensive unit tests for this code using the appropriate testing framework:" |
| **Review** | "Do a senior engineer code review. Focus on: correctness, performance, edge cases, readability:" |

**7.5.3 Streaming Response**
- Express route `POST /api/ai` sets `Content-Type: text/event-stream`
- Calls Claude API with `stream: true`
- Tokens are forwarded to client as SSE events
- Client uses `EventSource` to receive and render tokens as they arrive
- Typing animation effect as tokens stream in

**7.5.4 Response Rendering**
- Markdown rendering with syntax highlighting in output
- "Copy" button on code blocks
- "Apply to Editor" button for Fix responses (replaces selected code in Monaco)

---

### 7.6 Presence & Collaboration UX

**7.6.1 User Avatars**
- Top bar shows circular avatars for all active users
- Each has initials + unique color
- Tooltip on hover shows full name and join time

**7.6.2 "Follow Mode"**
- Click a user's avatar to follow their cursor (viewport scrolls to match theirs)
- Like Figma's "follow" feature
- Click again to release

**7.6.3 Room Chat**
- Simple text chat panel (Socket.IO messages, no persistence)
- Used for quick comms without leaving the editor

---

## 8. Database Schema (PostgreSQL + Prisma)

```prisma
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  username     String    @unique
  passwordHash String
  createdAt    DateTime  @default(now())
  rooms        Room[]    @relation("RoomOwner")
  sessions     Session[]
}

model Room {
  id        String    @id @default(uuid())
  slug      String    @unique
  name      String
  language  String    @default("javascript")
  isPublic  Boolean   @default(true)
  pin       String?
  ownerId   String
  owner     User      @relation("RoomOwner", fields: [ownerId], references: [id])
  createdAt DateTime  @default(now())
  sessions  Session[]
}

model Session {
  id        String    @id @default(uuid())
  roomId    String
  userId    String?
  guestName String?
  room      Room      @relation(fields: [roomId], references: [id])
  user      User?     @relation(fields: [userId], references: [id])
  joinedAt  DateTime  @default(now())
  leftAt    DateTime?
}
```

---

## 9. API Routes

### Auth Routes (`/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Get JWT tokens |
| POST | `/refresh` | Refresh access token |
| POST | `/logout` | Invalidate refresh token |
| GET | `/me` | Get current user |

### Room Routes (`/api/rooms`)
| Method | Path | Description |
|---|---|---|
| POST | `/` | Create room |
| GET | `/:slug` | Get room metadata |
| PATCH | `/:slug` | Update room settings |
| DELETE | `/:slug` | Delete room (owner only) |
| GET | `/` | List user's rooms |

### Execution Route (`/api/run`)
| Method | Path | Description |
|---|---|---|
| POST | `/` | Execute code via Piston API |

### AI Route (`/api/ai`)
| Method | Path | Description |
|---|---|---|
| POST | `/` | Stream AI response (SSE) |

---

## 10. Frontend Pages & Components

### Pages (Next.js App Router)
| Route | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Hero, features, CTA |
| `/login` | `LoginPage` | Auth form |
| `/register` | `RegisterPage` | Auth form |
| `/dashboard` | `DashboardPage` | User's rooms list |
| `/room/[slug]` | `RoomPage` | The actual editor |
| `/room/new` | `NewRoomPage` | Create room form |

### Core Components
```
components/
├── editor/
│   ├── CollabEditor.tsx       # Monaco + Yjs binding
│   ├── CursorLabel.tsx        # Live cursor decorations
│   ├── LanguageSelector.tsx   # Dropdown for language
│   └── ThemeSelector.tsx      # Dropdown for theme
├── ai/
│   ├── AISidebar.tsx          # Sliding sidebar panel
│   ├── AIActionButtons.tsx    # Explain/Fix/Test/Review
│   └── StreamingResponse.tsx  # SSE token rendering
├── room/
│   ├── RoomHeader.tsx         # Top bar with user avatars
│   ├── UserAvatar.tsx         # Circular avatar with color
│   ├── RoomChat.tsx           # Chat panel
│   └── OutputPanel.tsx        # Code execution output
├── auth/
│   ├── LoginForm.tsx
│   └── RegisterForm.tsx
└── ui/                        # shadcn/ui components
```

---

## 11. Implementation Phases (8 Weeks)

### Week 1 — Foundation
- [ ] `npx create-next-app@latest collab-editor --typescript --tailwind --app`
- [ ] Set up Express backend + PostgreSQL + Prisma schema + migrations
- [ ] Implement auth: register, login, JWT middleware
- [ ] Landing page + Login/Register pages
- [ ] Dashboard page listing rooms

### Week 2 — Monaco Editor (Single User)
- [ ] Install `@monaco-editor/react`
- [ ] Build `CollabEditor.tsx` with language/theme switching
- [ ] Implement Run button → Piston API integration
- [ ] Output panel component (stdout/stderr)
- [ ] Room creation and join pages

### Week 3 — Real-time with Socket.IO (Naive)
- [ ] Add Socket.IO to Express server
- [ ] Implement rooms: `join-room`, `leave-room`, `code-change` events
- [ ] Broadcast code changes to all room members
- [ ] Show active user count in room header
- [ ] Test: two browser tabs syncing (will conflict — intentional)

### Week 4 — Yjs CRDTs (The Core)
- [ ] Set up `y-websocket` server (separate process)
- [ ] Replace naive Socket.IO sync with `y-monaco` + `Y.Doc`
- [ ] Implement Yjs Awareness API for cursor positions
- [ ] Render live cursors using Monaco decorations
- [ ] Persist Yjs documents with `y-leveldb`
- [ ] Test conflict resolution: two users type simultaneously

### Week 5 — AI Sidebar
- [ ] Install `@anthropic-ai/sdk`
- [ ] Implement `/api/ai` SSE streaming route
- [ ] Build `AISidebar.tsx` with `EventSource` client
- [ ] Implement all 4 actions: Explain, Fix, Generate Tests, Review
- [ ] "Apply to Editor" button for Fix responses

### Week 6 — Polish & UX
- [ ] Follow Mode (click avatar to follow cursor)
- [ ] Room Chat (Socket.IO)
- [ ] Private rooms with PIN
- [ ] User avatars in top bar
- [ ] Mobile-responsive layout
- [ ] Error states, loading states, empty states
- [ ] Custom Monaco themes (Dracula, Monokai)

### Week 7 — Testing & Performance
- [ ] Unit tests (Jest) for API routes
- [ ] Integration tests for auth flow
- [ ] Load test: 10 concurrent users in one room
- [ ] Lighthouse audit on landing page
- [ ] Fix any CRDT edge cases found in testing
- [ ] Rate limiting on `/api/ai` and `/api/run`

### Week 8 — Deployment & Launch
- [ ] Deploy frontend to Vercel
- [ ] Deploy backend + y-websocket to Railway
- [ ] Set up Railway PostgreSQL
- [ ] Configure environment variables
- [ ] Add Dockerfile (4 lines for Railway)
- [ ] Write README with architecture diagram
- [ ] Share in coding communities

---

## 12. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Latency** | Yjs updates propagate in < 100ms on same continent |
| **Concurrency** | Support 50 concurrent users across rooms (v1) |
| **Uptime** | 99% (Railway + Vercel SLAs cover this) |
| **Security** | JWT httpOnly cookies, rate limiting, input sanitization |
| **Code Execution** | Sandboxed by Piston API, 10s timeout |
| **Data Privacy** | Room contents not stored permanently (Yjs LevelDB, not PostgreSQL) |

---

## 13. Environment Variables

### Backend (`.env`)
```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret
ANTHROPIC_API_KEY=sk-ant-...
PISTON_API_URL=https://emkc.org/api/v2/piston
PORT=3001
CLIENT_URL=http://localhost:3000
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:1234
```

---

## 14. Success Metrics

| Metric | Target |
|---|---|
| Real users trying the app | 50+ in first week after launch |
| GitHub stars | 100+ |
| Average session length | > 10 minutes |
| AI sidebar usage rate | > 40% of sessions |
| Interview mentions | "Tell me about CollabCode" heard in at least 3 interviews |

---

## 15. Open Questions (To Resolve)

1. **Claude vs GPT-4o** — Claude Sonnet 3.5 is preferred for code. Is the user's API key Anthropic or OpenAI?
2. **y-websocket server port** — Default is 1234. Do we run it on the same Railway service or separate?
3. **Feature follow mode** — Include in v1 or push to v2?
4. **Guest auth** — Full guest support (no account) or force registration?

---

*This PRD is the source of truth. All implementation decisions reference this document. Claude instruction file will be added before execution begins.*
