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
├── Settings
│   ├── Company profile
│   ├── Branding (logo)
│   ├── Regional defaults
│   └── Team
├── Companies
│   └── Contacts
├── Pipeline → Stages → Deals (owner assignment)
├── Enquiries (inbound leads; status workflow)
├── Quotes → Quote items (+ Services catalog)
├── Activities (linked to company / contact / deal)
└── Users (profile image, password, sessions)
```

### Tenancy

Users belong to an organization via `members`. On register, a user becomes **owner** of a new org and receives a default pipeline.

MVP assumption: one primary membership per user. Invites attach additional users to an existing org.

Every CRM query must be scoped by `organizationId` from `requireMembership()`.

## Key packages

| Path | Role |
|------|------|
| `app/(app)/*` | Authenticated CRM screens |
| `app/(auth)/*` | Login / register |
| `app/(print)/*` | Printable quote layout |
| `app/api/*` | Health, auth, onboarding, v1 |
| `components/*` | Feature UI + primitives |
| `components/data-table/*` | Shared lists (filters, columns, bulk actions) |
| `lib/db/*` | Schema, client, migrations |
| `lib/actions/*` | Server actions (mutations + queries) |
| `lib/auth.ts` | Better Auth server config |
| `middleware.ts` | Session cookie gate for protected routes (incl. `/uploads`) |

## Auth flow

1. User registers or logs in via Better Auth  
2. Cookie session established  
3. Register client calls `POST /api/onboarding` to create org + pipeline if missing  
4. `requireMembership()` loads org context for server-rendered pages  

Sensitive account ops (password change, session revoke) go through Better Auth / `lib/actions/account.ts`.

## Data layer

- **ORM:** Drizzle with `postgres` (postgres.js) driver  
- **Migrations:** SQL files in `lib/db/migrations`, applied by `scripts/migrate.ts`  
- **IDs:** Prefixed nanoid-style ids (`co_…`, `deal_…`, …) via `lib/id.ts`  

## UI patterns

- **Data tables** — search, column filters, visible columns, drag reorder (prefs in `localStorage`), bulk select/delete  
- **Searchable selects** — type-to-search companies/contacts/etc.; contacts filter by selected company  
- **Notifications** — count of enquiries with status `new` (header bell + nav badges)  

## Pipeline

Default stages on org create:

`Lead → Qualified → Proposal → Negotiation → Won | Lost`

Deal stage moves update `deals.stage_id` (Kanban uses `@dnd-kit`). Cards show assignee avatars when set.

## Uploads

Logos and avatars are stored under `public/uploads/` (Docker volume in Compose).

- Filenames are scoped by user/org id  
- Middleware requires a **session cookie** to fetch `/uploads/*` (not world-readable)  
- User content is **gitignored** and must never be committed  

## Deploy shape

```
docker compose
  db   (postgres:16-alpine + volume; loopback port bind)
  app  (build Next.js, migrate, next start; uploads volume)
```

See [install.md](./install.md).

## Future directions

- Separate `api` package if non-Next clients dominate  
- Redis / job queue for email and imports  
- Authenticated upload proxy with signed URLs if public CDN is needed  
- Row-level security or stronger audit logging for multi-tenant SaaS  
