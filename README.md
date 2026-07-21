# open-crm

**Own your pipeline.**

A clean, self-hostable CRM for small teams who want full data ownership—without Salesforce complexity or SaaS lock-in.

[![CI](https://github.com/MrMooreUK/open-crm/actions/workflows/ci.yml/badge.svg)](https://github.com/MrMooreUK/open-crm/actions/workflows/ci.yml)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)](./docker-compose.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

---

## Why open-crm?

| Problem | open-crm |
|---------|----------|
| Spreadsheets fall apart at scale | Real companies, contacts, deals & pipeline |
| SaaS CRM is expensive and sticky | Self-host, export anytime, AGPL source |
| Enterprise tools are heavy | Dense, calm UI—lists over marketing chrome |
| “Open source” installs are painful | `docker compose up -d` and go |

Built for **founders, sales pods, and agencies** (roughly 1–50 people).

---

## Features

### Core CRM

| Area | What you get |
|------|----------------|
| **Companies & contacts** | Linked records, quick-add, search-or-create company |
| **Deals & pipeline** | List + Kanban drag-and-drop, assignee avatars, stage breadcrumb on deal detail |
| **Enquiries** | Inbound requests, status workflow, teammate assignment, notification badge |
| **Quotes** | Line items, tax, bill-to snapshot, status workflow, print/PDF |
| **Services** | Priced catalog for one-click quote lines |
| **Activities & tasks** | Notes, calls, emails, meetings; open-task list with complete |

### Productivity

- **Data tables** — search, column filters, show/hide/reorder columns (saved in the browser), bulk select & delete  
- **Company → contact cascade** — pick a company, only see its people on forms  
- **Type-to-search** selects for companies, contacts, enquiries, deals, services  
- **Global search** across companies, contacts, and deals  
- **Dashboard** — open deals, pipeline value, tasks, recent activity  

### Team & settings

- **Invites** — link-based, owner / member roles  
- **Organization** — company profile, logo/branding, regional defaults (timezone, currency, locale, dates, fiscal year), team  
- **Your account** — name, email, profile photo (or default avatar), password, active sessions  
- **Notifications** — header bell + nav badge for enquiries in status `new`  

### Install & ops

- **Docker Compose** — app + Postgres, migrations on start  
- **Health check** — `GET /api/health`  
- **Contact I/O** — CSV, TSV, JSON, vCard, Excel (UI + `GET /api/v1/contacts/export`)  

### Design

Calm **zinc** chrome with a restrained **teal** accent for primary actions and the logo—dense tables, short copy, no flashy gradients.

See [docs/ui.md](./docs/ui.md).

---

## Quick start

### Docker (recommended)

```bash
git clone https://github.com/MrMooreUK/open-crm.git
cd open-crm
cp .env.example .env
# Production: set a strong BETTER_AUTH_SECRET and your public HTTPS URLs first
docker compose up -d
```

Open **http://localhost:3000** → create an account → workspace is ready (default pipeline stages included).

<details>
<summary><strong>Production secrets (required on any shared host)</strong></summary>

```bash
cp .env.example .env
# BETTER_AUTH_SECRET=$(openssl rand -base64 32)
# BETTER_AUTH_URL=https://crm.example.com
# APP_URL=https://crm.example.com
# POSTGRES_PASSWORD=…   # optional but recommended beyond local demos
docker compose up -d
```

Postgres is bound to **127.0.0.1** by default (not exposed on the LAN). Details: [docs/install.md](./docs/install.md) · [SECURITY.md](./SECURITY.md).

</details>

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

Optional demo data (register first):

```bash
npm run db:seed
```

More: [docs/development.md](./docs/development.md)

---

## Screenshots

> Screenshots welcome—open a PR with PNGs under [`docs/images/`](./docs/images/).

| Home | Pipeline | Records |
|------|----------|---------|
| Dashboard stats & recent activity | Drag deals across stages | Filterable lists, bulk actions |

---

## Stack

| Layer | Technology |
|-------|------------|
| App | [Next.js](https://nextjs.org) App Router + TypeScript |
| UI | React, Tailwind CSS, Lucide |
| Database | PostgreSQL 16 + [Drizzle ORM](https://orm.drizzle.team) |
| Auth | [Better Auth](https://www.better-auth.com) (email / password sessions) |
| Validation | Zod |
| Deploy | Docker Compose |

Architecture: [docs/architecture.md](./docs/architecture.md)

---

## Project layout

```
open-crm/
├── app/                 # Routes: (app), (auth), (print), api
├── components/          # Feature UI + shared data-table / primitives
├── lib/                 # Auth, DB schema/migrations, server actions
├── scripts/             # migrate, seed
├── docs/                # Install, architecture, UI, API, roadmap
├── docker-compose.yml
├── Dockerfile
└── LICENSE              # AGPL-3.0
```

---

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes (host tooling) | Postgres connection string |
| `BETTER_AUTH_SECRET` | **yes in production** | Session signing secret (32+ chars) |
| `BETTER_AUTH_URL` | yes | Public app origin (browser URL) |
| `APP_URL` | yes | Same as above for redirects |
| `POSTGRES_PASSWORD` | optional | Compose DB password (default is for local demos only) |

**Never commit `.env`.** Only [`.env.example`](./.env.example) is tracked.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (http://localhost:3000) |
| `npm run build` / `start` | Production build & server |
| `npm run lint` / `typecheck` | ESLint / TypeScript |
| `npm test` | Vitest unit tests |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load demo data |
| `npm run db:studio` | Drizzle Studio |

---

## API (overview)

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/health` | none | Liveness + DB ping |
| `GET /api/v1/me` | session | Current user + organization |
| `GET /api/v1/contacts/export?format=` | session | Contact export (`csv`, `tsv`, `json`, `vcf`, `xlsx`) |
| `/api/auth/*` | — | Better Auth (register, login, session, password) |

Most CRM mutations are **Server Actions** in `lib/actions/*` (first-party UI).

**In the running app:** sidebar → **Organization → Documentation** (`/docs`) — accordion for install, API, workflows, and more. Deep-link e.g. `/docs?section=api`.  
Repo markdown: [docs/](./docs/README.md).

---

## Documentation

| Guide | Topic |
|-------|--------|
| [docs/install.md](./docs/install.md) | Self-host & production |
| [docs/development.md](./docs/development.md) | Local setup & conventions |
| [docs/architecture.md](./docs/architecture.md) | System design |
| [docs/ui.md](./docs/ui.md) | UI patterns & brand tokens |
| [docs/api.md](./docs/api.md) | HTTP surface |
| [docs/contacts-import-export.md](./docs/contacts-import-export.md) | Contact I/O |
| [docs/enquiries-quotes.md](./docs/enquiries-quotes.md) | Enquiries & quotes |
| [docs/roadmap.md](./docs/roadmap.md) | Shipped vs planned |
| [docs/README.md](./docs/README.md) | Full index |
| [CHANGELOG.md](./CHANGELOG.md) | Release notes |
| [SECURITY.md](./SECURITY.md) | Vulnerability reporting |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute |

---

## Contributing

Bug fixes, docs, UX polish, and small features first.

1. Read [CONTRIBUTING.md](./CONTRIBUTING.md)  
2. Open an issue for larger changes  
3. Fork → branch → PR  

Please follow the [Code of Conduct](./CODE_OF_CONDUCT.md).

### Good first contributions

- Empty-state copy and accessibility  
- Screenshots under `docs/images/`  
- Keyboard shortcuts on the pipeline  
- Tests for domain helpers / server actions  
- Company import/export (mirroring contacts)  

---

## Security

**Do not** open public issues for vulnerabilities. See [SECURITY.md](./SECURITY.md).

Self-host checklist: strong `BETTER_AUTH_SECRET`, HTTPS public URL, keep Postgres off the public internet, never commit secrets or `public/uploads/**` user files.

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
  ·
  <a href="./docs/README.md">Docs</a>
</p>
