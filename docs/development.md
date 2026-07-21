# Development

## Prerequisites

- Node.js **22+**
- npm
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
| `npm run build` / `start` | Production build / serve |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest |
| `npm run db:generate` | SQL migration from schema |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema (prototyping only) |
| `npm run db:seed` | Demo data (after first register) |
| `npm run db:studio` | Drizzle Studio |

## Conventions

### Multi-tenancy

Scope every CRM row by `organization_id`. Use `requireMembership()`; never trust a client-supplied org id.

### Mutations

Prefer **Server Actions** in `lib/actions/*`. Call `revalidatePath` for affected routes.

### Schema changes

1. Edit `lib/db/schema.ts`  
2. `npm run db:generate`  
3. Review `lib/db/migrations/`  
4. `npm run db:migrate`  
5. Commit schema + migration + meta together  

### Lists

Use `components/data-table/*` so filters, columns, and bulk delete stay consistent.

### UI

- Zinc chrome, teal primary only (see [ui.md](./ui.md))  
- Prefer `components/ui/*`  
- Dense tables, short copy  

### Auth

Better Auth at `/api/auth/*`. Session helpers in `lib/session.ts`. Onboarding: `POST /api/onboarding`.

### Secrets

- `.env` from `.env.example` — never commit `.env`  
- `public/uploads/**` is gitignored  

## Checks before PR

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Update docs (and CHANGELOG when behaviour changes).

## Debugging

- Terminal logs from Next.js  
- `GET /api/health`  
- Session cookies from Better Auth  
- `npm run db:studio` or `docker compose exec db psql -U opencrm`  
