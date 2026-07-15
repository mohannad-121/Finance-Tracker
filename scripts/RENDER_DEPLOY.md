Run and Deploy Guide — Render and Local

1) Local prerequisites
- Node 18+ and Git
- Install pnpm globally or enable via Corepack:
  - `npm install -g pnpm` or
  - `corepack enable && corepack prepare pnpm@latest --activate`

2) Install dependencies (repo root)

PowerShell / Bash:
```
cd "d:/java 2/Finance-Tracker-main"
pnpm install
```

3) Run backend locally

Build then start (PowerShell):
```
pnpm --filter ./artifacts/api-server run build
$env:PORT=3001; pnpm --filter ./artifacts/api-server run start
```
Or Bash:
```
pnpm --filter ./artifacts/api-server run build
PORT=3001 pnpm --filter ./artifacts/api-server run start
```

Health: http://localhost:3001/api/healthz

4) Run frontend locally

Create `.env` from `.env.example` in `artifacts/aurawallet` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.

Start dev server:
```
pnpm --filter ./artifacts/aurawallet run dev
```
Frontend default: http://localhost:5173

5) Deploy to Render

- Commit and push `render.yaml` (repo root) to your branch.
- In Render dashboard, connect your Git repo and Render will detect the manifest.
- For the API service, set any required secret env vars (database URLs, Supabase service keys) in Render.
- For the frontend static site, set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Render's Environment settings, and optionally `VITE_API_BASE_URL`.

6) Notes
- The repo uses pnpm workspace filters; Render build commands enable Corepack and install pnpm before building.
- The API requires `PORT` (Render injects it automatically for web services).
- If you want me to also add Dockerfiles or GitHub Actions, tell me which you prefer.
