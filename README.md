# Crestview Academy School System
Static frontend (`public/`) + Vercel serverless API (`api/`).

## Deploy (2 minutes)
1. Push this folder to GitHub, then Vercel → Add New Project → import it. (Or run `npx vercel --prod` in this folder.)
2. Project Settings → Environment Variables: set `ADMIN_PASSWORD`, `AUTH_SECRET`.
3. For permanent data: Vercel → Storage/Marketplace → add Upstash Redis; it fills `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. Without it, data lives in temporary memory and resets.
4. Redeploy. Default password if unset: `admin123` (change it!).
