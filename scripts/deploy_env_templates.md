Deployment env templates

1) Vercel import CSV (use in Vercel UI -> Environment Variables -> Import):

KEY,VALUE,TARGET
DATABASE_URL,replace_with_database_url,Production,Preview,Development
JWT_SECRET,replace_with_jwt_secret,Production,Preview,Development
CLIENT_URL,https://your-frontend.example.com,Production
NEXT_PUBLIC_API_URL,https://api.example.com,Production
OPENROUTER_API_KEY,,Production
GEMINI_API_KEY,,Production
YJS_PORT,1234,Production

2) PM2 `env` snippet (paste into `deploy/pm2/ecosystem.config.cjs` `env` section):

env: {
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'replace-with-secret',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  YJS_PORT: process.env.YJS_PORT || '1234'
}

3) GitHub Actions secrets names (add to repo Settings → Secrets & variables → Actions):
- DATABASE_URL
- JWT_SECRET
- NEXT_PUBLIC_API_URL
- OPENROUTER_API_KEY (optional)
- GEMINI_API_KEY (optional)
