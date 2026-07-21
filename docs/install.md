# Installation

## Requirements

- **Docker** and Docker Compose (recommended path), **or**
- **Node.js 22+** and a PostgreSQL 16 database for local/dev installs

## Docker Compose (production-style)

```bash
git clone https://github.com/MrMooreUK/open-crm.git
cd open-crm
```

### 1. Secrets (required for any shared/production host)

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | What to set |
|----------|-------------|
| `BETTER_AUTH_SECRET` | Long random string (32+ chars) — **required** |
| `BETTER_AUTH_URL` | Public URL, e.g. `https://crm.example.com` |
| `APP_URL` | Same as `BETTER_AUTH_URL` |
| `POSTGRES_PASSWORD` | Strong password (optional override; default is only for local demos) |

Generate a secret:

```bash
openssl rand -base64 32
```

### 2. Start

```bash
docker compose up -d
```

- App: http://localhost:3000 (or your mapped host/port)  
- Postgres: **localhost only** on port `5432` (not exposed to the LAN by default)

The app container runs migrations on startup, then starts Next.js.

### 3. First user

Open the app → **Create account** → enter your name, organization, email, and password.

A default sales pipeline (Lead → … → Won/Lost) is created automatically.

### Stop / reset

```bash
docker compose down          # keep data volume
docker compose down -v       # wipe database + uploads volumes
```

## Production hardening

1. **Never use the default `BETTER_AUTH_SECRET`** on a public host  
2. Terminate **TLS** at Caddy, nginx, Traefik, or a cloud load balancer  
3. Set `BETTER_AUTH_URL` / `APP_URL` to the **HTTPS** origin users type in the browser  
4. Keep Postgres on a private network; the compose file binds `127.0.0.1:5432` by default  
5. Change `POSTGRES_PASSWORD` and align the app’s `DATABASE_URL` if you customize it in compose  
6. Back up the `pgdata` and `uploads` volumes  
7. Restrict who can reach port `3000` (firewall / reverse proxy auth as needed)  

See [SECURITY.md](../SECURITY.md).

## Reverse proxy (optional)

Terminate TLS and proxy to `app:3000`.

```env
BETTER_AUTH_URL=https://crm.example.com
APP_URL=https://crm.example.com
```

`NODE_ENV=production` is set on the app service in Compose.

## Local development install

See [development.md](./development.md).

## Health check

```bash
curl -s http://localhost:3000/api/health
# {"status":"ok","db":"up"}
```

## Troubleshooting

| Symptom | Check |
|---------|--------|
| App restarts / migrate fails | `docker compose logs app` — is Postgres healthy? |
| Cannot register / login loops | `BETTER_AUTH_URL` must match the browser origin exactly |
| Stale schema | Pull latest migrations; `docker compose up -d --build` or `npm run db:migrate` |
| Port 3000 / 5432 in use | Change host ports in `docker-compose.yml` |
| Uploads missing after recreate | Uploads live in the `uploads` named volume — don’t delete it unless intentional |
