# Installation

## Requirements

- **Docker** and Docker Compose (recommended path), **or**
- **Node.js 22+** and a PostgreSQL 16 database for local/dev installs

## Docker Compose (production-style)

```bash
git clone https://github.com/MrMooreUK/open-crm.git
cd open-crm
```

### 1. Secrets (recommended for any shared/production host)

```bash
cp .env.example .env
# edit BETTER_AUTH_SECRET to a long random value
# set BETTER_AUTH_URL and APP_URL to your public URL, e.g. https://crm.example.com
```

Generate a secret:

```bash
openssl rand -base64 32
```

### 2. Start

```bash
docker compose up -d
```

- App: http://localhost:3000 (or your mapped host/port)  
- Postgres: port `5432` on the host (user/password/db: `opencrm` by default)

The app container runs migrations on startup, then starts Next.js.

### 3. First user

Open the app → **Create account** → enter your name, organization, email, and password.

A default sales pipeline (Lead → … → Won/Lost) is created automatically.

### Stop / reset

```bash
docker compose down          # keep data volume
docker compose down -v       # wipe database volume
```

## Reverse proxy (optional)

Terminate TLS at Caddy, nginx, or Traefik and proxy to `app:3000`.

Set:

```env
BETTER_AUTH_URL=https://crm.example.com
APP_URL=https://crm.example.com
```

Ensure cookies work over HTTPS in production (`NODE_ENV=production` is set in Compose for the app service).

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
| Cannot register | `BETTER_AUTH_URL` must match the URL you use in the browser |
| Stale schema | Run `npm run db:migrate` (dev) or recreate containers after pulling new migrations |
| Port 3000 / 5432 in use | Change host ports in `docker-compose.yml` |
