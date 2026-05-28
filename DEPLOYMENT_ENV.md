Deployment environment variables

This project requires the following environment variables to run correctly. Add them to your host (Vercel project settings, server `.env`, PM2 `ecosystem.config`, or GitHub Actions secrets) — do NOT commit real secrets to git.

- `DATABASE_URL` : Prisma database connection string. Example: `postgresql://user:pass@db.example.com:5432/collabeditor`. For local dev you can use `file:./dev.db`.
- `JWT_SECRET` : Secret used to sign JSON Web Tokens for authentication. Provide a strong random string.
- `CLIENT_URL` : Public URL of the frontend (used by CORS). Example: `https://your-frontend.vercel.app`.
- `NEXT_PUBLIC_API_URL` : Public API base URL used by the frontend to call the backend (must start with `http(s)://`). Example: `https://api.example.com`.
- `OPENROUTER_API_KEY` : (optional) API key for OpenRouter AI integration (used in `backend/src/routes/ai.ts`).
- `GEMINI_API_KEY` : (optional) API key for Gemini/Google AI integration (used in `backend/src/routes/ai.ts`).
- `YJS_PORT` : (optional) port for the Yjs websocket server (default in code: `1234`).
- `PORT` : (optional) backend port (default `5000`). Not required on serverless platforms.

Where to set them:
- Vercel (frontend): go to your Project → Settings → Environment Variables. Add `NEXT_PUBLIC_API_URL` (and any other frontend `NEXT_PUBLIC_` vars) for `Production`, `Preview`, and `Development` environments.
- Backend host (server/VM/container): place the variables in a `.env` file on the server (read by the backend), or configure them in the service manager (PM2 `ecosystem.config.cjs` `env` section, or systemd unit `Environment=` entries).
- GitHub Actions: add secrets in the repository Settings → Secrets & variables → Actions. Use them to run CI builds or deployment steps.

Security notes:
- Never commit real keys. Use `.env.example` (this repo) for placeholders only.
- Rotate keys if they are accidentally committed or exposed.
