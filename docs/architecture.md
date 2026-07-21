# Architecture

## Overview

open-crm is a **single Next.js application** with colocated UI and API routes, backed by PostgreSQL.

```
Browser
  → Next.js App Router (RSC + client components)
  → Server Actions / Route Handlers
  → Better Auth (session)
  → Drizzle ORM
  → PostgreSQL
```

Why a monolith for v0.1:

- One Docker image, one deploy  
- Shared types and Zod schemas  
- Faster iteration for a small team  

The UI is intentionally not the only client: actions and `/api/v1/*` can grow toward a fuller HTTP API.

## Domains

```
Organization
├── Members (owner | member)
├── Invites
├── Settings (timezone, currency, locale, …)
├── Companies
│   └── Contacts
├── Pipeline → Stages → Deals
└── Activities (linked to company / contact / deal)
```

### Tenancy

Users belong to an organization via `members`. On register, a user becomes **owner** of a new org and receives a default pipeline.

MVP assumption: one primary membership per user. Invites attach additional users to an existing org.

## Key packages

| Path | Role |
|------|------|
| `app/(app)/*` | Authenticated CRM screens |
| `app/(auth)/*` | Login / register |
| `app/api/*` | Health, auth, onboarding, v1 |
| `components/*` | Feature UI + primitives |
| `lib/db/*` | Schema, client, migrations |
| `lib/actions/*` | Server actions (mutations + queries) |
| `lib/auth.ts` | Better Auth server config |
| `middleware.ts` | Cookie presence gate for protected routes |

## Auth flow

1. User registers or logs in via Better Auth  
2. Cookie session established  
3. Register client calls `POST /api/onboarding` to create org + pipeline if missing  
4. `requireMembership()` loads org context for server-rendered pages  

## Data layer

- **ORM:** Drizzle with `postgres` (postgres.js) driver  
- **Migrations:** SQL files in `lib/db/migrations`, applied by `scripts/migrate.ts`  
- **IDs:** Prefixed nanoid-style ids (`co_…`, `deal_…`, …) via `lib/id.ts`  

## Pipeline

Default stages on org create:

`Lead → Qualified → Proposal → Negotiation → Won | Lost`

Deal stage moves update `deals.stage_id` (Kanban uses `@dnd-kit`).

## Deploy shape

```
docker compose
  db   (postgres:16-alpine + volume)
  app  (build Next.js, migrate, next start)
```

See [install.md](./install.md).

## Future directions

- Separate `api` package if non-Next clients dominate  
- Redis / job queue for email and imports  
- Row-level security or stronger audit logging for multi-tenant SaaS  
