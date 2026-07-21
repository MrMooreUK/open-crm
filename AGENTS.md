# Agent notes for open-crm

Help for AI coding agents (and humans) working in this repo.

## Stack

- **Next.js** App Router  
- **PostgreSQL** + **Drizzle** (`lib/db/schema.ts`, migrations in `lib/db/migrations/`)  
- **Better Auth** (`lib/auth.ts`, `/api/auth/*`)  
- **Server Actions** in `lib/actions/*`  
- **UI** — zinc chrome + teal primary; see `docs/ui.md`  

## Non-negotiables

1. **Scope CRM queries by `organizationId`** from `requireMembership()`.  
2. **Schema changes** → edit schema → `npm run db:generate` → commit migrations.  
3. **UI stays calm** — zinc neutrals, teal for primary actions only; no rainbow gradients or glassmorphism.  
4. **Primary CTAs** use brand (`Button` or `.btn-primary`), not bare `bg-zinc-900` or multi-colour gradients.  
5. **Secrets** stay in env; never commit `.env`, keys, or `public/uploads/**` content.  
6. Prefer shared **data-table** and form patterns.  
7. **Keep docs in sync** with user-facing behaviour (README, CHANGELOG, relevant `docs/*`).  

## Commands

```bash
docker compose up -d db
npm run db:migrate
npm run dev
npm run typecheck && npm run lint && npm test && npm run build
```

## Docs map

| Doc | Purpose |
|-----|---------|
| `README.md` | Product overview + quick start |
| `docs/install.md` | Self-host / Docker |
| `docs/development.md` | Local conventions |
| `docs/architecture.md` | System design |
| `docs/ui.md` | UI & brand |
| `docs/api.md` | HTTP surface |
| `docs/roadmap.md` | What’s next |
| `docs/enquiries-quotes.md` | Enquiries & quotes |
| `docs/contacts-import-export.md` | Contact I/O |
| `SECURITY.md` | Reporting + self-host checklist |
| `CHANGELOG.md` | Release notes |
