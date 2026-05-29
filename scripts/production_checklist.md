Production Quick Checklist

1. Build both apps

```bash
npm --prefix backend run build
npm --prefix frontend run build
```

2. Run the seed (if needed)

```bash
npm --prefix backend run seed # requires DATABASE_URL in backend/.env or env
```

3. Start services (example with pm2)

```bash
npx pm2 start deploy/pm2/ecosystem.config.cjs
```

4. Confirm health

```bash
curl http://localhost:5000/health
curl http://localhost:3000/
```

5. If all OK, create a release tag (see `scripts/release.sh`)
