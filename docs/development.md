# Development

## Prerequisites

- Node.js **22+**
- npm (ships with Node)
- Docker (for Postgres)

## Setup

```bash
cp .env.example .env
docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

| Service | URL |
|---------|-----|
| App | http://localhost:3000 |
| Postgres | `postgresql://opencrm:opencrm@localhost:5432/opencrm` (loopback only) |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Create SQL migration from schema changes |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema without migration files (prototyping only) |
| `npm run db:seed` | Demo companies/contacts/deals (after first register) |
| `npm run db:studio` | Browse DB in Drizzle Studio |

## Project conventions

### Multi-tenancy

Every CRM row is scoped by `organization_id`. Server actions call `requireMembership()` and filter queries by `organizationId`. Never trust a client-supplied org id.

### Mutations

Prefer **Server Actions** in `lib/actions/*` for form posts. Revalidate the affected paths with `revalidatePath`.

### Schema changes

1. Edit `lib/db/schema.ts`  
2. `npm run db:generate`  
3. Review SQL under `lib/db/migrations/`  
4. `npm run db:migrate`  
5. Commit schema + migration + meta together  

### Lists / data tables

Use `components/data-table/*` for entity lists so filters, columns, and bulk delete stay consistent. Wire bulk delete via `makeBulkDeleteAction` + a `deleteMany(ids)` server action.

### UI & brand

- **Minimal chrome**, zinc neutrals, teal brand for primary actions and identity  
- Tokens in `app/globals.css` (`brand`, `brand-subtle`, …)  
- Logo: `BrandMark` / `BrandWordmark`  
- Prefer `components/ui/*` primitives  
- Full notes: [ui.md](./ui.md)  

### Auth

Better Auth routes live at `/api/auth/*`. Session helpers: `lib/session.ts`. Register creates org + default pipeline via `/api/onboarding`.

### Secrets & local data

- Copy `.env.example` → `.env` (never commit `.env`)  
- `public/uploads/**` is gitignored — only `.gitkeep` is tracked  
- Do not paste production secrets into issues, PRs, or screenshots  

## Checks before PR

```bash
npm run typecheck
npm run lint
npm run build
```

Update docs when you change user-facing behaviour, env vars, or install steps.

## Debugging tips

- Logs: Next.js terminal output  
- Health: `GET /api/health`  
- Session: browser cookies for Better Auth  
- DB: `npm run db:studio` or `docker compose exec db psql -U opencrm`  
