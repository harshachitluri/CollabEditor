# 🚀 Vercel Deployment Guide

## Deployment Strategy

Since CollabCode is a full-stack app, we recommend:
- **Frontend:** Deploy to Vercel (Next.js)
- **Backend:** Deploy to Railway, Render, or Heroku (Node.js + Database)

This is the cleanest approach.

---

## Option 1: Frontend on Vercel (Recommended)

### Step 1: Prepare Frontend
```bash
cd frontend
npm install
npm run build
```

### Step 2: Deploy to Vercel
```bash
npm install -g vercel
vercel
```

**During setup:**
- Project name: `collabcode-frontend`
- Framework: Next.js
- Root directory: `frontend`

### Step 3: Set Environment Variables in Vercel Dashboard
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_WS_URL=wss://your-backend-url.com
```

---

## Option 2: Backend on Railway (Recommended)

### Step 1: Prepare Backend
```bash
cd backend
npm install
npm run build
```

### Step 2: Deploy to Railway
1. Go to https://railway.app
2. Create account
3. New Project → Deploy from GitHub
4. Select your repository
5. Configure environment variables

### Step 3: Set Environment Variables in Railway
```
DATABASE_URL=file:./dev.db
JWT_SECRET=your-secret-key-123
JWT_REFRESH_SECRET=refresh-secret-456
PORT=3001
CLIENT_URL=https://your-frontend-vercel.vercel.app
```

### Step 4: Add PostgreSQL (Optional, for production)
```sql
-- In Railway, add PostgreSQL plugin
-- It automatically provides DATABASE_URL
```

---

## Option 3: Monorepo on Single Vercel

If deploying everything on Vercel:

### vercel.json Setup
Already configured in `/vercel.json`

### Build Commands
```json
{
  "buildCommand": "npm install && npm run build:all",
  "outputDirectory": "./public"
}
```

### package.json Scripts
```json
{
  "build:all": "npm run build:frontend && npm run build:backend",
  "build:frontend": "cd frontend && npm run build",
  "build:backend": "cd backend && npm run build"
}
```

---

## Quick Start: Deploy Everything

### 1. Clean and Rebuild
```bash
npm install
npm run build:all
```

### 2. Deploy Frontend
```bash
cd frontend
npm install -g vercel
vercel
```

### 3. Deploy Backend
```bash
cd backend
vercel
```

### 4. Update API URLs
- In Vercel Frontend Settings → Environment Variables
  - `NEXT_PUBLIC_API_URL` = backend URL
  - `NEXT_PUBLIC_WS_URL` = backend WebSocket URL

---

## Environment Variables Checklist

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://backend-url.com
NEXT_PUBLIC_WS_URL=wss://backend-url.com
```

### Backend (.env)
```env
DATABASE_URL="file:./dev.db"  # or PostgreSQL URL
JWT_SECRET="super-secret-key-123"
JWT_REFRESH_SECRET="refresh-secret-456"
PORT=3001
CLIENT_URL="https://frontend-url.vercel.app"
```

---

## Database Setup

### Option A: SQLite (Development/Demo)
- Uses `./dev.db` locally
- Works on Vercel with persistent storage
- Limited to single instance

### Option B: PostgreSQL (Production)
1. Add PostgreSQL addon in Railway
2. Copy `DATABASE_URL`
3. Update `.env` in backend
4. Run: `npx prisma migrate deploy`

---

## Testing After Deployment

```bash
# Test frontend
curl https://your-frontend.vercel.app

# Test backend API
curl https://your-backend.railway.app/health

# Test code execution
curl -X POST https://your-backend.railway.app/api/run \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"Hello\")","language":"javascript"}'
```

---

## Troubleshooting

### WebSocket Connection Fails
- Check `NEXT_PUBLIC_WS_URL` is correct
- Verify backend supports WebSocket
- Check CORS settings

### Code Execution Returns Error
- Verify Python/Node.js installed on backend
- Check backend logs: `vercel logs`
- Test with JavaScript (most reliable)

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Run migrations: `npx prisma migrate deploy`
- Check database is accessible from Vercel

---

## Monitoring

### Vercel Dashboard
- View logs: `vercel logs`
- Monitor build: Deployments tab
- Check Analytics

### Railway Dashboard
- View logs in real-time
- Monitor resource usage
- Check deployments

---

## Next Steps

1. ✅ Commit all changes: `git add . && git commit -m "prepare for Vercel deployment"`
2. ✅ Push to GitHub: `git push origin main`
3. ✅ Connect to Vercel: https://vercel.com/new
4. ✅ Set environment variables
5. ✅ Deploy!

---

**Deployment Time:** ~5-10 minutes  
**Estimated Cost:** Free tier (Frontend), Free tier or ~$5/month (Backend)
