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

Why a monolith:

- One Docker image, one deploy  
- Shared types and Zod schemas  
- Fast iteration for a small team  

## Domains

```
Organization
├── Members (owner | member)
├── Invites
├── Settings (profile, branding, regional, team)
├── Companies
│   └── Contacts
├── Pipeline → Stages → Deals (owner assignment)
├── Enquiries (inbound; status workflow)
├── Quotes → Quote items (+ Services catalog)
├── Activities (company / contact / deal)
└── Users (profile image, password, sessions)
```

### Tenancy

Users join an organization via `members`. On register, a user becomes **owner** of a new org and receives a default pipeline.

Assumption: one primary membership per user. Invites attach more users to an existing org.

Every CRM query must be scoped by `organizationId` from `requireMembership()`.

## Key packages

| Path | Role |
|------|------|
| `app/(app)/*` | Authenticated CRM screens |
| `app/(auth)/*` | Login / register |
| `app/(print)/*` | Printable quote layout |
| `app/api/*` | Health, auth, onboarding, v1 |
| `components/*` | Feature UI + primitives |
| `components/data-table/*` | Shared lists (filters, columns, bulk) |
| `lib/db/*` | Schema, client, migrations |
| `lib/actions/*` | Server actions |
| `lib/auth.ts` | Better Auth server config |
| `lib/avatar.ts` | Default avatar helper |
| `middleware.ts` | Session gate (incl. `/uploads`) |
| `app/globals.css` | Brand tokens + base styles |

## Auth flow

1. Register or log in via Better Auth  
2. Cookie session established  
3. Register calls `POST /api/onboarding` for org + default pipeline  
4. `requireMembership()` loads org context on app pages  

Account ops: `lib/actions/account.ts` + Better Auth (password, sessions).

## Data layer

- **ORM:** Drizzle + `postgres` (postgres.js)  
- **Migrations:** `lib/db/migrations` via `scripts/migrate.ts`  
- **IDs:** Prefixed nanoid-style ids via `lib/id.ts`  

## UI patterns

See [ui.md](./ui.md).

- Zinc chrome + teal primary  
- Data tables, searchable selects, company→contact cascade  
- Notifications for enquiries with status `new`  
- Deal stage breadcrumb on deal detail  

## Pipeline

Default stages:

`Lead → Qualified → Proposal → Negotiation → Won | Lost`

Kanban updates `deals.stage_id` (`@dnd-kit`). Cards show assignee avatars when set.

## Uploads

- User files under `public/uploads/` (Compose volume; **gitignored**)  
- Session required for `/uploads/*`  
- Default avatar is static: `/default-avatar.svg` (public, not private)  

## Deploy

```
docker compose
  db   (postgres:16-alpine; loopback port bind)
  app  (build, migrate, next start; uploads volume)
```

See [install.md](./install.md).

## Future directions

- Richer REST API / API tokens  
- Webhooks, custom fields, light automations  
- Optional SMTP and OAuth  
