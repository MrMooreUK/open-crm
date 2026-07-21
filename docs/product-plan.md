# open-crm — Product & Technical Plan

> **Note:** This is the original design document (historical). For **current**
> status and features, see [roadmap.md](./roadmap.md) and the root
> [README.md](../README.md). License is **AGPL-3.0**. Quoting, enquiries, and
> much of the “later” MVP have since shipped on `main`.

**Working title:** open-crm  
**Status:** Historical plan (MVP largely implemented)  
**Author:** Grok (xAI)  
**Date:** 2026-07-21  
**License:** AGPL-3.0

---

## 1. Vision

**open-crm** is a modern, self-hostable, open-source CRM built for small teams and startups who want full data ownership without SaaS lock-in.

### Positioning

| Dimension | Choice |
|-----------|--------|
| Who | Indie founders, small sales/ops teams (1–50 people), agencies |
| What | Contacts, companies, deals/pipeline, activities, basic automation |
| Why open source | Own your data, audit the code, self-host or run managed later |
| Why not another OSS CRM | Clean UX, modern stack, API-first, easy deploy, not enterprise bloat |

### Non-goals (v1)

- Full marketing automation / email blast platform
- Telephony / dialer / call recording
- Complex CPQ / quoting engines
- Multi-tenant SaaS billing (can come later as a hosted offering)
- Deep ERP / accounting replacement

---

## 2. Problem Statement

Teams outgrow spreadsheets but find HubSpot/Salesforce:

1. **Expensive** at scale or once free tiers end  
2. **Locked-in** — hard to export, hard to customize  
3. **Heavy** — features most small teams never use  

Existing open-source CRMs often feel dated, hard to install, or poorly documented. open-crm aims to be the “Postgres + clean UI” CRM you can run in an afternoon.

---

## 3. Success Criteria

### Product

- [ ] Create company → contact → deal → activity in under 2 minutes  
- [ ] Pipeline board drag-and-drop works smoothly  
- [ ] Full REST + typed API; UI is “just another client”  
- [ ] Single-command local dev; one Docker Compose for self-host  

### Engineering

- [ ] Type-safe end-to-end (shared types or OpenAPI-generated clients)  
- [ ] Migrations are first-class; zero manual SQL for routine schema  
- [ ] Test coverage on domain logic and API contracts  
- [ ] Clear CONTRIBUTING.md; first PR can land in &lt;1 hour for newcomers  

### Open source

- [ ] Public repo, clear license, CODE_OF_CONDUCT, security policy  
- [ ] Semantic versioning and changelog  
- [ ] Good first issues labeled  

---

## 4. Core Domain Model

```
Organization (tenant/workspace)
├── User / Membership (role: owner | admin | member)
├── Company (account)
│   └── Contact (person, linked to company optional)
├── Pipeline
│   └── Stage (ordered)
│       └── Deal (opportunity; amount, close date, owner)
├── Activity (note | call | email | meeting | task)
│   └── linked to Contact | Company | Deal
├── Tag / Custom field (phase 2)
└── Audit log (phase 2)
```

### Key entities (MVP)

| Entity | Key fields |
|--------|------------|
| **Organization** | name, slug |
| **User** | email, name, password/hash or OIDC |
| **Company** | name, domain, industry, owner_id |
| **Contact** | name, email, phone, company_id, owner_id |
| **Pipeline / Stage** | name, position, probability (optional) |
| **Deal** | title, amount, currency, stage_id, company_id, contact_id, owner_id, expected_close |
| **Activity** | type, body, due_at, completed_at, links |

---

## 5. MVP Feature Set (v0.1)

### Must ship

1. **Auth** — email/password + session (or magic link); invite by email  
2. **Companies & Contacts** — CRUD, search, list filters  
3. **Deals & Pipeline** — Kanban board + list view; stage moves  
4. **Activities** — notes and tasks on records; simple timeline  
5. **Global search** — name/email/deal title  
6. **Settings** — org profile, members, basic roles  
7. **API** — REST under `/api/v1`, OpenAPI spec  
8. **Self-host** — Docker Compose (app + Postgres + optional Redis)  

### Nice-to-have for v0.1 if time allows

- CSV import (contacts/companies)  
- Keyboard shortcuts on pipeline  
- Activity reminders (due tasks)  

### Explicitly deferred

- Email sync / Gmail-Outlook integration  
- Workflows / automations  
- Reports & dashboards beyond basic counts  
- Mobile native apps  
- Plugins marketplace  

---

## 6. Recommended Tech Stack

Opinionated defaults for speed and maintainability. Swap only with strong reason.

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Language | **TypeScript** (monorepo) | Shared types, huge hiring pool |
| API | **Hono** or **Fastify** on Node 22+ | Fast, typed, small surface |
| ORM | **Drizzle** | SQL-like, great migrations, no heavy magic |
| DB | **PostgreSQL 16** | Relational CRM data fits well; JSONB for flexible fields later |
| Auth | **Better Auth** or **Lucia**-style sessions | Self-host friendly; avoid Auth0 for OSS default |
| Frontend | **Next.js (App Router)** or **TanStack Start** | SSR + SPA hybrid; strong ecosystem |
| UI | **React + Tailwind + shadcn/ui** | Accessible, consistent, fork-friendly |
| Validation | **Zod** | Shared schemas API ↔ UI |
| Jobs (later) | **BullMQ + Redis** | Email, reminders, imports |
| Deploy | **Docker Compose** first; Fly/Railway docs later | Self-hosters win day one |

### Monorepo layout (proposed)

```
open-crm/
├── apps/
│   ├── web/                 # UI
│   └── api/                 # HTTP API (or colocated if single app)
├── packages/
│   ├── db/                  # Drizzle schema, migrations
│   ├── shared/              # Zod schemas, types, constants
│   └── config/              # ESLint, TSConfig
├── docker-compose.yml
├── docs/
├── open-crm-grok-plan.md
└── README.md
```

**Alternative (simpler for v0):** single Next.js app with Route Handlers + Drizzle. Split when the API needs independent scaling or non-Next clients dominate.

---

## 7. Architecture Principles

1. **API-first** — Anything the UI can do, the API can do with the same auth.  
2. **Multi-tenant by org** — Every business row scoped by `organization_id`.  
3. **Soft deletes optional** — Prefer hard delete + audit later; don’t over-engineer.  
4. **Idempotent migrations** — All schema via migration files.  
5. **Boring reliability** — Postgres transactions for deal stage moves + activity log.  
6. **Security defaults** — CSRF for cookie sessions, rate limits on auth, parameterized queries only.  

### High-level request flow

```
Browser → Web app → API (/api/v1) → Auth middleware → Domain services → Drizzle → Postgres
```

---

## 8. API Sketch (v1)

Base: `/api/v1`  
Auth: session cookie (browser) + bearer token (integrations, phase 2)

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /me

GET    /companies
POST   /companies
GET    /companies/:id
PATCH  /companies/:id
DELETE /companies/:id

GET    /contacts
POST   /contacts
...

GET    /pipelines
GET    /pipelines/:id/stages
GET    /deals
POST   /deals
PATCH  /deals/:id          # includes stage_id moves
POST   /deals/:id/move     # optional explicit endpoint

GET    /activities
POST   /activities
PATCH  /activities/:id

GET    /search?q=
GET    /members
POST   /invites
```

Pagination: cursor or `limit` + `offset` (start with offset; document switch path).  
Errors: `{ "error": { "code": "...", "message": "..." } }` with consistent HTTP status codes.

---

## 9. UX Principles

- **Dense but calm** — CRM users live in lists; avoid empty-state theater  
- **Keyboard-friendly** — create (`c`), search (`/`), board navigation  
- **Progressive disclosure** — default fields first; custom fields later  
- **Optimistic UI** on pipeline drag where safe  
- **Mobile-usable** responsive web (not mobile-first native)  

### Primary screens (MVP)

1. Dashboard (counts: open deals, tasks due, recent activity)  
2. Pipeline board  
3. Deals list  
4. Companies list + detail  
5. Contacts list + detail  
6. Global search  
7. Settings (org, team)  

---

## 10. Phased Roadmap

### Phase 0 — Foundations (week 1–2)

- Repo scaffold, lint, CI (GitHub Actions: typecheck, test, lint)  
- Postgres + Drizzle schema for org/user/company/contact/deal/activity  
- Auth (register, login, session, org membership)  
- Docker Compose  
- README with 5-minute quickstart  

### Phase 1 — MVP CRM (week 3–6)

- CRUD UI for companies, contacts, deals  
- Pipeline Kanban  
- Activities timeline  
- Search  
- OpenAPI export  
- Seed script with sample data  

### Phase 2 — Usability (month 2–3)

- CSV import/export  
- Tags, filters, saved views  
- Tasks due / simple reminders  
- Permissions polish (owner vs member)  
- Audit log of key changes  

### Phase 3 — Integrations (month 3–5)

- Webhooks on deal stage change  
- API tokens for external tools  
- Email compose via SMTP (outbound only)  
- Optional OAuth (Google) for login  

### Phase 4 — Platform (month 5+)

- Custom fields  
- Basic automation rules (“when stage = Won, create task”)  
- Reports (win rate, pipeline by stage)  
- Plugin hooks / extension points  
- Hosted offering considerations  

---

## 11. Open Source Strategy

### License

- **Default recommendation: AGPL-3.0** — protects against closed SaaS forks without contributing back.  
- **Alternative: Apache-2.0** — friendlier to commercial embeds; weaker copyleft.  
- Decide before first public release; document in LICENSE and README.

### Governance

- Benevolent maintainer model initially (you as BDFL)  
- CONTRIBUTING.md: branch strategy, PR checklist, code style  
- SECURITY.md: private vulnerability reporting  
- CODE_OF_CONDUCT.md: Contributor Covenant  

### Community bootstrapping

- Clear “good first issue” labels  
- Architecture Decision Records (ADRs) for stack choices  
- Discord or GitHub Discussions for support  
- Demo instance (optional, later) with reset data  

### Branding

- Name: **open-crm** (check npm/crates/Docker Hub availability early)  
- Tagline draft: *“Own your pipeline.”*  
- Simple logo + favicon before launch  

---

## 12. Security & Compliance Baseline

- Password hashing: Argon2id or bcrypt  
- HTTPS-only cookies in production  
- Org isolation enforced in every query (defense in depth: middleware + repo layer)  
- Rate limit login and register  
- No secrets in git; `.env.example` only  
- Dependency scanning in CI (e.g. `npm audit` / Dependabot)  
- GDPR-friendly: export/delete user data path documented even if not fully automated in v0.1  

---

## 13. Testing Strategy

| Layer | Approach |
|-------|----------|
| Unit | Domain helpers, validators (Zod) |
| Integration | API tests against real Postgres (Testcontainers or dockerized CI) |
| E2E | Playwright critical paths: login → create deal → move stage |
| Manual | Checklist before each release |

Definition of done for features: tests + docs snippet + seed data if new entity.

---

## 14. Observability (minimal)

- Structured logs (JSON in production)  
- Request IDs  
- Health endpoint: `GET /health` (db ping)  
- Metrics/tracing deferred until hosted multi-user load  

---

## 15. Documentation Plan

| Doc | Purpose |
|-----|---------|
| README | What it is, quickstart, screenshots |
| docs/install.md | Docker, env vars, reverse proxy notes |
| docs/api.md | Or generated OpenAPI UI (Scalar/Swagger) |
| docs/development.md | Local setup, conventions |
| docs/architecture.md | Domain + package layout |
| CHANGELOG.md | User-facing changes |

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Scope creep into “full HubSpot” | Ruthless MVP cut; this plan’s non-goals |
| OSS CRM competition | Win on UX + install simplicity, not feature parity |
| Auth complexity | Start with email/password only |
| Multi-tenant bugs | Always filter by `organization_id`; integration tests |
| Burnout on polish | Ship ugly-but-working board first, iterate UI |

---

## 17. Immediate Next Steps (execution order)

1. Initialize git repo + LICENSE + README skeleton  
2. Scaffold monorepo (or single Next app) with TypeScript  
3. Add Postgres + Drizzle; migrate core tables  
4. Implement auth + org membership  
5. API CRUD for companies/contacts/deals  
6. Build pipeline Kanban UI  
7. Docker Compose + quickstart docs  
8. Seed data + first e2e test  
9. Public launch checklist (screenshots, good first issues)  

---

## 18. Open Questions (to resolve before build)

1. **License:** AGPL-3.0 vs Apache-2.0?  
2. **App shape:** Monolith Next.js vs separate `api` + `web`?  
3. **Auth:** Password only at first, or magic link too?  
4. **Multi-org:** One user in multiple orgs in MVP, or single-org users?  
5. **Name conflict:** Is `open-crm` free on GitHub/npm/Docker Hub?  

---

## Appendix A — Sample Deal Stage Defaults

```
Lead → Qualified → Proposal → Negotiation → Won
                                         ↘ Lost
```

## Appendix B — Env Vars (sketch)

```bash
DATABASE_URL=postgresql://...
SESSION_SECRET=...
APP_URL=http://localhost:3000
NODE_ENV=development
```

## Appendix C — Definition of MVP Done

A new contributor can:

1. Clone the repo  
2. Run `docker compose up` (or documented `pnpm dev`)  
3. Register an account  
4. Create a company, contact, and deal  
5. Drag the deal across the pipeline  
6. Add a note  
7. Find the contact via search  

…without reading source code beyond the README.

---

*This plan is a living document. Update it when major scope or architecture decisions change; record why in short ADRs under `docs/adr/`.*
