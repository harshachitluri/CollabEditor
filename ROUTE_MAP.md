Project route map — file index and responsibilities

Backend
- [backend/src/app.ts](backend/src/app.ts): Express + HTTP server bootstrap, mounts routes, configures CORS, starts Socket.IO.
- [backend/src/socket.ts](backend/src/socket.ts): Socket.IO event handlers for rooms, cursor broadcast, presence.
- [backend/src/yjs-server.ts](backend/src/yjs-server.ts): Optional Yjs websocket server entry (real-time CRDT backend).
- [backend/src/routes/auth.ts](backend/src/routes/auth.ts): Login / register endpoints, JWT generation (uses `JWT_SECRET`).
- [backend/src/routes/ai.ts](backend/src/routes/ai.ts): AI endpoints; reads `OPENROUTER_API_KEY` and `GEMINI_API_KEY`.
- [backend/src/routes/rooms.ts](backend/src/routes/rooms.ts): Room CRUD and listing.
- [backend/src/routes/run.ts](backend/src/routes/run.ts): Code execution/run endpoint (sandboxing considerations).
- [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts): Express JWT auth middleware (verifies `JWT_SECRET`).
- [backend/src/lib/prisma.ts](backend/src/lib/prisma.ts): Prisma client initialization.
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma): Database schema and datasource (reads `DATABASE_URL`).
- [backend/prisma/seed.js|seed.ts](backend/prisma/seed.js): Seed script to create demo user & room.
- [backend/package.json](backend/package.json): Backend scripts (`start:prod`, `build`, `seed`), dependencies.
- [backend/Dockerfile](backend/Dockerfile): Dockerfile for backend containerization.

Frontend
- [frontend/app/page.tsx](frontend/app/page.tsx) & app router: top-level Next.js app pages and route layout.
- [frontend/app/layout.tsx](frontend/app/layout.tsx): App-level layout, global providers (Auth/Theme).
- [frontend/app/components/CollabEditor.tsx](frontend/app/components/CollabEditor.tsx): Monaco editor wrapper, remote cursor decorations and collaboration logic.
- [frontend/app/components/ClientOnly.tsx](frontend/app/components/ClientOnly.tsx): Prevents SSR/hydration issues by rendering only on client.
- [frontend/app/components/AIChatBot.tsx](frontend/app/components/AIChatBot.tsx): Chat UI that calls backend AI routes (uses `NEXT_PUBLIC_API_URL`).
- [frontend/app/context/AuthContext.tsx](frontend/app/context/AuthContext.tsx): Auth provider + token handling.
- [frontend/app/context/ThemeContext.tsx](frontend/app/context/ThemeContext.tsx): Theme provider and toggle.
- [frontend/app/hooks/useSocket.ts](frontend/app/hooks/useSocket.ts): Socket.IO client setup and helpers (connects to `NEXT_PUBLIC_API_URL`).
- [frontend/app/room/[slug]/page.tsx](frontend/app/room/[slug]/page.tsx): Room page wiring editor, socket callbacks, and UI.
- [frontend/package.json](frontend/package.json): Frontend scripts (`dev`, `build`, `start:prod`), dependencies.
- [frontend/Dockerfile](frontend/Dockerfile): Dockerfile to build and serve the Next.js production build.
- [frontend/next.config.ts](frontend/next.config.ts): Next.js configuration.

DevOps & scripts
- [deploy/pm2/ecosystem.config.cjs](deploy/pm2/ecosystem.config.cjs): PM2 process config for backend & frontend (env blocks present).
- [deploy/systemd/collab-backend.service](deploy/systemd/collab-backend.service): Example systemd unit for backend service.
- [deploy/systemd/collab-frontend.service](deploy/systemd/collab-frontend.service): Example systemd unit for frontend.
- [docker-compose.yml](docker-compose.yml): Compose stack for local staging (frontend + backend + db).
- [.github/workflows/ci.yml](.github/workflows/ci.yml): CI workflow to install, build, lint, and run audits for frontend & backend.
- [scripts/release.sh](scripts/release.sh): Local release helper to build, lint, audit, and create a release branch + tag.
- [scripts/production_checklist.md](scripts/production_checklist.md): Quick smoke-test checklist to run on the target host.
- [scripts/deploy_env_templates.md](scripts/deploy_env_templates.md): Vercel CSV + PM2 env + GH Actions secret names for easy handoff.

Env & security
- [.env.example](.env.example): Example env vars (placeholders only) — never commit real secrets.
- [DEPLOYMENT_ENV.md](DEPLOYMENT_ENV.md): Which env vars to provide to Vercel/host and why.

Misc
- [README.md](README.md): Project overview and quick start (update as needed).
- [PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md): Release/production checklist and notes created during staging.

Important env variables referenced in code (hand these to your deployer):
- `DATABASE_URL` (Prisma)
- `JWT_SECRET` (auth)
- `CLIENT_URL` (CORS)
- `NEXT_PUBLIC_API_URL` (frontend → backend)
- `OPENROUTER_API_KEY`, `GEMINI_API_KEY` (optional AI integrations)
- `YJS_PORT`, `PORT` (optional ports)

How to hand off to your friend (quick):
1. Give them `DEPLOYMENT_ENV.md` and `.env.example` to know the keys.
2. Provide Vercel CSV from `scripts/deploy_env_templates.md` for easy import.
3. For server/VM, put envs in `/etc/systemd/system` unit or the PM2 `env` section in `deploy/pm2/ecosystem.config.cjs`.
