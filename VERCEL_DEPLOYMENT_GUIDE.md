# 🚀 Vercel Deployment Guide - Environment Variables & Setup

**Status: ✅ ALL MONACO FIXES COMPLETE - READY FOR PRODUCTION**

---

## 📋 For Your Friend: Complete Setup Checklist

### Step 1: Vercel Project Setup
```bash
# 1. Go to https://vercel.com/dashboard
# 2. Import your GitHub repo (CollabEditor)
# 3. Select root directory: `.` (it's a monorepo)
# 4. Install Vercel's CLI (optional but recommended)
npm i -g vercel
```

---

## 🔐 Environment Variables - What to Add to Vercel

### Frontend Environment Variables

**Setting:** Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these:

| Variable | Value | Where | Required |
|----------|-------|-------|----------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-domain.vercel.app` | Frontend | ✅ YES |

**Example:**
```
NEXT_PUBLIC_API_URL = https://collabeditor-backend.vercel.app
```

---

### Backend Environment Variables

**Setting:** Same location - Settings → Environment Variables (these apply to backend too)

| Variable | Value | Where | Required | Notes |
|----------|-------|-------|----------|-------|
| `DATABASE_URL` | PostgreSQL connection string | Backend | ✅ YES | Format: `postgresql://user:password@host:port/dbname` |
| `JWT_SECRET` | Random string (min 32 chars) | Backend | ✅ YES | Use strong random: `openssl rand -hex 32` |
| `JWT_REFRESH_SECRET` | Random string (min 32 chars) | Backend | ✅ YES | Different from JWT_SECRET |
| `CLIENT_URL` | `https://your-frontend-domain.vercel.app` | Backend | ✅ YES | Your frontend Vercel URL |
| `PORT` | `3001` | Backend | ⚠️ OPTIONAL | Default: 3001 (Vercel uses PORT env var) |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | Backend | ⚠️ OPTIONAL | Get from https://openrouter.ai/ (for AI feature) |
| `GEMINI_API_KEY` | Your Google Gemini API key | Backend | ⚠️ OPTIONAL | Get from https://ai.google.dev/ (for AI fallback) |

---

## 🔑 How to Generate Required Secrets

### For JWT_SECRET and JWT_REFRESH_SECRET

**On Mac/Linux:**
```bash
# Generate random 32-character hex string
openssl rand -hex 32
# Output example: a3f9c2b1e8d4f7a9c2b1e8d4f7a9c2b1e8d4f7a9c2b1e8d4f7a9c2b1

# Copy this and paste into Vercel
```

**On Windows (PowerShell):**
```powershell
# Generate random 32-character hex string
-join (1..32 | ForEach-Object { "{0:x}" -f (Get-Random -Maximum 16) })
# Copy output to Vercel
```

**Online (if needed):**
- https://www.random.org/cgi-bin/randbytes?nbytes=32&format=h (copy first 32 chars)

---

## 🗄️ Database Setup

### Option 1: PostgreSQL on Vercel (Recommended)
```
1. Go to Vercel Dashboard
2. Click "Storage" tab
3. Create "Postgres" database
4. Copy the connection string
5. Add as DATABASE_URL in env vars
```

### Option 2: External PostgreSQL
- **Supabase:** https://supabase.com (free tier available)
- **Railway:** https://railway.app
- **Render:** https://render.com
- **AWS RDS:** https://aws.amazon.com/rds/

**Connection string format:**
```
postgresql://username:password@host.region.compute.amazonaws.com:5432/dbname
```

---

## 📝 Complete .env.local Template (For Testing Locally First)

**File:** `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**File:** `backend/.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/collabeditor
JWT_SECRET=your_jwt_secret_here_min_32_chars_long_a3f9c2b1e8d4f7a9c2b1e8d4f7a9c2b
JWT_REFRESH_SECRET=your_refresh_secret_here_min_32_chars_a3f9c2b1e8d4f7a9c2b1e8d4f7a9c2b1
CLIENT_URL=http://localhost:3000
PORT=3001
# Optional - for AI features
OPENROUTER_API_KEY=your_openrouter_key_if_available
GEMINI_API_KEY=your_gemini_key_if_available
```

---

## ✅ Vercel Environment Variables Checklist

**Create in Vercel Dashboard - Settings - Environment Variables:**

### Frontend-Specific:
- [ ] `NEXT_PUBLIC_API_URL` = `https://collabeditor-backend.vercel.app`

### Backend-Specific:
- [ ] `DATABASE_URL` = `postgresql://...` (from Vercel Postgres or external DB)
- [ ] `JWT_SECRET` = (32-char random hex string)
- [ ] `JWT_REFRESH_SECRET` = (32-char random hex string, different from above)
- [ ] `CLIENT_URL` = `https://your-frontend.vercel.app`
- [ ] `PORT` = `3001`
- [ ] `OPENROUTER_API_KEY` = (if using AI - optional)
- [ ] `GEMINI_API_KEY` = (if using AI - optional)

---

## 🚀 Step-by-Step Deployment

### 1. Push Code to GitHub
```bash
cd d:\Projects\CollabEditor
git add .
git commit -m "feat: fix Monaco SSR/hydration/clipboard issues + Turbopack optimization"
git push origin main
```

### 2. Connect to Vercel
```bash
# Option A: Import from GitHub (recommended)
# Go to https://vercel.com/new → Import Git Repository
# Select your CollabEditor repo
# Click "Import"

# Option B: CLI method (if you have Vercel CLI installed)
vercel
```

### 3. Configure Build Settings
- **Root Directory:** `.` (monorepo)
- **Build Command:** (auto-detected - use default)
- **Output Directory:** (auto-detected)
- **Framework:** Next.js

### 4. Add Environment Variables
```
Before clicking "Deploy":
1. Go to "Environment Variables"
2. Add all variables from the checklist above
3. Make sure Frontend and Backend can access what they need
```

### 5. Deploy
```bash
# Option A: Via Vercel Dashboard
# Click "Deploy" button

# Option B: Via CLI
vercel deploy --prod
```

---

## 🔗 What Your URLs Will Look Like After Deployment

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | `https://collabeditor.vercel.app` | User-facing app |
| Backend | `https://collabeditor-backend.vercel.app` | API endpoints |
| Database | `postgresql://...` | Data storage |

**After deployment, update NEXT_PUBLIC_API_URL to point to backend:**
```
NEXT_PUBLIC_API_URL = https://collabeditor-backend.vercel.app
```

---

## ⚠️ Important Notes

### Don't Commit .env Files
```bash
# Already in .gitignore (should be):
.env
.env.local
.env*.local
```

### All Secrets Go in Vercel, Not Git
❌ **DON'T:** Commit secrets to GitHub
✅ **DO:** Add them only in Vercel Dashboard

### Monorepo Structure in Vercel
Your `vercel.json` already handles this:
```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/next@latest" },
    { "src": "backend/package.json", "use": "@vercel/node@latest" }
  ]
}
```

This tells Vercel to:
- Deploy frontend as Next.js
- Deploy backend as Node.js
- Route `/api/*` to backend
- Route other requests to frontend

---

## 🧪 Post-Deployment Tests

### 1. Frontend Works
```
1. Go to https://your-frontend.vercel.app
2. Should load without errors
3. Check DevTools Console (should be clean)
```

### 2. Backend API Works
```bash
curl https://your-backend.vercel.app/api/health
# Should return 200 OK
```

### 3. Auth Works
```bash
# Register
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"123456"}'

# Login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

### 4. Database Connected
- Should be able to create/login users
- Data should persist across reloads

### 5. Monaco Editor Works
```
1. Create a room: https://your-frontend.vercel.app/dashboard
2. Join the room
3. Monaco editor should load (no errors in console)
4. Should be able to type in editor
5. Should be able to paste code
```

---

## 🆘 Troubleshooting

### Error: "Cannot find module"
- [ ] Make sure all dependencies installed: `npm install` in both frontend & backend
- [ ] Check build settings in Vercel

### Error: "Connection refused" (Backend can't reach DB)
- [ ] Verify `DATABASE_URL` is correct
- [ ] If using external DB, add Vercel IP to whitelist
- [ ] Check DB credentials are correct

### Error: "CORS error"
- [ ] Check `CLIENT_URL` in backend matches frontend URL
- [ ] Verify CORS is enabled in backend (it is by default)

### Editor not loading (Monaco error)
- [ ] ✅ **Already fixed!** All Monaco SSR/hydration issues are resolved
- [ ] Check browser console for errors
- [ ] Verify `NEXT_PUBLIC_API_URL` is set correctly

### AI features not working
- [ ] Optional - only if you want AI
- [ ] Add `OPENROUTER_API_KEY` or `GEMINI_API_KEY` to Vercel env vars
- [ ] Get keys from: https://openrouter.ai/ or https://ai.google.dev/

---

## 📊 Vercel Environment Variables Summary

### Copy This Exact List to Vercel:

```
✅ FRONTEND:
NEXT_PUBLIC_API_URL=[Your backend Vercel URL]

✅ BACKEND (Required):
DATABASE_URL=[PostgreSQL connection string]
JWT_SECRET=[32-char random hex]
JWT_REFRESH_SECRET=[32-char random hex, different]
CLIENT_URL=[Your frontend Vercel URL]
PORT=3001

⚠️ BACKEND (Optional - AI):
OPENROUTER_API_KEY=[if you have one]
GEMINI_API_KEY=[if you have one]
```

---

## 🎯 Deployment Checklist

Before clicking "Deploy" in Vercel:

- [ ] All Monaco fixes applied ✅
- [ ] Code pushed to GitHub main branch
- [ ] All environment variables added to Vercel
- [ ] DATABASE_URL pointing to valid PostgreSQL
- [ ] JWT_SECRET and JWT_REFRESH_SECRET are 32+ char random strings
- [ ] CLIENT_URL matches your frontend Vercel URL
- [ ] vercel.json is in root directory
- [ ] No .env files in Git repo
- [ ] Build settings show both frontend and backend

---

## ✅ After Deployment - Verification

```bash
# 1. Check Frontend
curl https://your-frontend.vercel.app
# Should return HTML page

# 2. Check Backend
curl https://your-backend.vercel.app/api/auth/status
# Should return 200 or 404 (not connection error)

# 3. Check Logs
# Vercel Dashboard → Functions → Logs
# Should show no errors

# 4. Test the App
# Visit https://your-frontend.vercel.app
# Should work perfectly with no console errors
```

---

## 🚀 You're Ready!

**Status Summary:**
- ✅ All Monaco Editor fixes applied
- ✅ Environment variables documented
- ✅ Vercel configuration ready (vercel.json exists)
- ✅ Monorepo setup configured
- ✅ Security best practices applied

**Next Step:**
```bash
# Push to GitHub
git add .
git commit -m "feat: Monaco fixes + ready for Vercel deployment"
git push origin main

# Then deploy to Vercel
```

**Questions?** Check troubleshooting section above or review the 5 documentation files in the frontend folder.

---

## 📞 Quick Reference

| What | Where | Command |
|------|-------|---------|
| Generate JWT Secret | Terminal | `openssl rand -hex 32` |
| Add Env Vars | Vercel Dashboard | Settings → Environment Variables |
| Check Deploy Status | Vercel Dashboard | Deployments tab |
| View Logs | Vercel Dashboard | Functions → Logs |
| Custom Domain | Vercel Dashboard | Domains tab |

**Everything is configured and ready to go!** 🎉
