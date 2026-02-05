# Terrarun backend (local dev)

Prerequisites:
- Node.js (>=14)
- PostgreSQL
- Redis

Quick start (from repository root):

```bash
cd backend
npm install
# copy .env.sample to .env and fill values
# on Windows Powershell:
copy .env.sample .env

npm run dev
```

Health check: http://localhost:3000/api/healthz

Notes:
- The server expects routes under `src/routes/*` and uses the config in `src/config`.
- Set a secure `JWT_SECRET` in production.
