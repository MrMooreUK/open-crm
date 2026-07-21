# Agent notes for open-crm

This file helps AI coding agents (and humans) work in this repo without fighting conventions.

## Stack

- **Next.js** App Router (see installed Next docs under `node_modules/next/dist/docs/` for version-specific APIs)
- **PostgreSQL** + **Drizzle** (`lib/db/schema.ts`, migrations in `lib/db/migrations/`)
- **Better Auth** (`lib/auth.ts`, routes at `/api/auth/*`)
- **Server Actions** in `lib/actions/*` for CRM mutations
- **Brand UI** — teal tokens in `app/globals.css`; see `docs/ui.md`

## Non-negotiables

1. **Always scope CRM queries by `organizationId`** from `requireMembership()`.
2. **Schema changes** → edit schema → `npm run db:generate` → commit migrations.
3. **UI stays minimal** — zinc neutrals + restrained teal brand; no marketing chrome.
4. **Primary CTAs use brand** (`Button` default or `.btn-primary`) — not bare `bg-zinc-900`.
5. **Secrets** stay in env files; never commit `.env`, keys, or `public/uploads/**` content.
6. Prefer shared **data-table** and form patterns over one-off list UIs.
7. **Keep docs in sync** with user-facing behaviour (README, changelog, relevant `docs/*`).

## Useful commands

```bash
docker compose up -d db
npm run db:migrate
npm run dev
npm run typecheck && npm run lint && npm run build
```

## Docs map

| Doc | Purpose |
|-----|---------|
| `README.md` | Product overview + quick start |
| `docs/install.md` | Self-host / Docker |
| `docs/development.md` | Local dev conventions |
| `docs/architecture.md` | System design |
| `docs/ui.md` | Brand tokens + UI patterns |
| `docs/api.md` | HTTP surface |
| `docs/roadmap.md` | What’s next |
| `docs/enquiries-quotes.md` | Enquiries, quotes, notifications |
| `docs/contacts-import-export.md` | Contact I/O |
| `SECURITY.md` | Vulnerability reporting + self-host checklist |
| `CHANGELOG.md` | Release notes |
