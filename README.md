# open-crm

**Own your pipeline.**

A clean, self-hostable CRM for small teams who want full data ownership—without Salesforce complexity or SaaS lock-in.

[![CI](https://github.com/MrMooreUK/open-crm/actions/workflows/ci.yml/badge.svg)](https://github.com/MrMooreUK/open-crm/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)

---

## Why open-crm?

| Problem | open-crm |
|---------|----------|
| Spreadsheets fall apart at scale | Real companies, contacts, deals & pipeline |
| SaaS CRM is expensive and sticky | Self-host, export anytime, AGPL source |
| Enterprise tools are heavy | Minimalist UI—dense lists, not marketing chrome |
| “Open source” installs are painful | `docker compose up -d` and go |

Built for **founders, sales pods, and agencies** (roughly 1–50 people).

---

## Features

- **Companies & contacts** — CRUD, linked records, quick-add contacts with search-or-create company
- **Deals & pipeline** — list view + Kanban board with drag-and-drop stage moves
- **Activities** — notes, calls, emails, meetings, and tasks on any record
- **Tasks** — open-task list with one-click complete
- **Search** — global search across companies, contacts, and deals
- **Dashboard** — open deals, pipeline value, tasks, recent activity
- **Team** — invite links, owner / member roles
- **Regional settings** — timezone, default currency, locale, date format, fiscal year
- **API-friendly** — health check, session auth, REST under `/api/v1`
- **One-command install** — Docker Compose (app + Postgres)

### Roadmap (near term)

- CSV import / export  
- Webhooks & API tokens  
- Custom fields  
- Basic automation rules  
- Deeper reporting  

See [docs/roadmap.md](./docs/roadmap.md) for the full plan.

---

## Quick start

### Docker (recommended)

```bash
git clone https://github.com/MrMooreUK/open-crm.git
cd open-crm
docker compose up -d
```

Open **http://localhost:3000**, register, and create your workspace.

> **Production:** set a strong secret before going live:
>
> ```bash
> echo "BETTER_AUTH_SECRET=$(openssl rand -base64 32)" > .env
> docker compose up -d
> ```

### Local development

Requires **Node.js 22+** and Docker (for Postgres).

```bash
git clone https://github.com/MrMooreUK/open-crm.git
cd open-crm
cp .env.example .env
docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

Optional demo data (register an account first):

```bash
npm run db:seed
```

More detail: [docs/install.md](./docs/install.md) · [docs/development.md](./docs/development.md)

---

## Screenshots

> Screenshots welcome—open a PR with PNGs under `docs/images/`.

| Home | Pipeline | Contacts |
|------|----------|----------|
| Dashboard with pipeline value & activity | Drag deals across stages | Quick-add with company search |

---

## Stack

| Layer | Technology |
|-------|------------|
| App | [Next.js](https://nextjs.org) (App Router) + TypeScript |
| UI | React, Tailwind CSS, Lucide icons |
| Database | PostgreSQL 16 + [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Better Auth](https://www.better-auth.com) (email / password sessions) |
| Validation | Zod |
| Deploy | Docker Compose |

Architecture notes: [docs/architecture.md](./docs/architecture.md)

---

## Project layout

```
open-crm/
├── app/                 # Next.js routes (UI + API)
├── components/          # UI and feature components
├── lib/                 # Auth, DB, actions, validations
├── scripts/             # migrate, seed
├── docs/                # Guides and roadmap
├── docker-compose.yml
├── Dockerfile
└── LICENSE              # AGPL-3.0
```

---

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | Postgres connection string |
| `BETTER_AUTH_SECRET` | yes (prod) | Session signing secret (32+ chars) |
| `BETTER_AUTH_URL` | yes | Public app URL |
| `APP_URL` | yes | Same as above for redirects |

Defaults for local Docker are in `docker-compose.yml`. Full list: [`.env.example`](./.env.example).

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (http://localhost:3000) |
| `npm run build` / `start` | Production build & server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Drizzle Studio |

---

## API (overview)

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Liveness + database ping |
| `GET /api/v1/me` | Current user + organization |
| `/api/auth/*` | Better Auth (register, login, session) |

See [docs/api.md](./docs/api.md).

---

## Contributing

Contributions are welcome—bug fixes, docs, UX polish, and small features first.

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)  
2. Open an issue for larger changes  
3. Fork → branch → PR  

Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

### Good first contributions

- Empty-state copy and accessibility  
- CSV import for contacts  
- Keyboard shortcuts on the pipeline  
- Tests for domain helpers / server actions  
- Screenshots and docs examples  

---

## Security

Please **do not** open public issues for vulnerabilities. See [SECURITY.md](./SECURITY.md).

---

## License

**[AGPL-3.0](./LICENSE)** — use, modify, and self-host freely. If you run a modified version as a network service, you must share the corresponding source with users of that service.

---

## Acknowledgments

Inspired by the idea that CRM data should belong to the teams that create it—not locked behind a vendor.

---

<p align="center">
  <strong>open-crm</strong> · Own your pipeline.
  <br />
  <a href="https://github.com/MrMooreUK/open-crm/stargazers">Star</a>
  ·
  <a href="https://github.com/MrMooreUK/open-crm/issues">Issues</a>
  ·
  <a href="./CONTRIBUTING.md">Contribute</a>
</p>
