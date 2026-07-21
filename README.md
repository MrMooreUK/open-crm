# open-crm

**Own your pipeline.** A clean, self-hosted open-source CRM for small teams.

- Companies, contacts, deals & pipeline board
- Notes, tasks & activity timelines
- Global search and a simple dashboard
- Invite teammates
- One-command install with Docker

## Quick start (Docker)

```bash
git clone https://github.com/your-org/open-crm.git
cd open-crm
docker compose up -d
```

Open **http://localhost:3000**, create an account, and start selling.

> For production, set a strong `BETTER_AUTH_SECRET` in a `.env` file (see `.env.example`).

## Local development

Requires Node 22+ and Docker (for Postgres).

```bash
# start database
docker compose up -d db

# install & migrate
cp .env.example .env
npm install
npm run db:migrate

# run app
npm run dev
```

Optional demo data (after you register once):

```bash
npm run db:seed
```

## Stack

| Layer | Choice |
|-------|--------|
| App | Next.js (App Router) |
| DB | PostgreSQL 16 + Drizzle ORM |
| Auth | Better Auth (email / password) |
| UI | Tailwind CSS, minimal dense layout |

## Features

- **Companies & contacts** — full CRUD, linked records
- **Deals & pipeline** — Kanban board with drag-and-drop stage moves
- **Activities** — notes, calls, emails, meetings, tasks on any record
- **Tasks** — open task list with complete toggle
- **Search** — companies, contacts, deals
- **Settings** — org name, members, invite links
- **API** — `GET /api/health`, `GET /api/v1/me`, Better Auth under `/api/auth/*`

## Environment

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Postgres connection string |
| `BETTER_AUTH_SECRET` | Session signing secret (32+ chars) |
| `BETTER_AUTH_URL` | Public app URL (e.g. `http://localhost:3000`) |
| `APP_URL` | Same as above for redirects |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` / `start` | Production |
| `npm run db:generate` | Generate migrations from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Demo data |
| `npm run db:studio` | Drizzle Studio |

## License

[AGPL-3.0](./LICENSE)
