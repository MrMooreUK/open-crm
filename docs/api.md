# API

open-crm is still **UI-first**. The HTTP surface below is the stable baseline for health checks and integrations.

**In the app:** Organization → **Documentation** (`/docs`), open the **HTTP API** accordion (or `/docs?section=api`).

Base URL (local): `http://localhost:3000`

## Authentication

Browser clients use **session cookies** from Better Auth (`/api/auth/*`).

For `GET /api/v1/*`, send the same session cookie the browser receives after login.

> API tokens / bearer auth are planned (see [roadmap.md](./roadmap.md)).

## Endpoints

### `GET /api/health`

Liveness and database connectivity. No auth.

**200**

```json
{ "status": "ok", "db": "up" }
```

**503**

```json
{ "status": "error", "db": "down" }
```

---

### `GET /api/v1/me`

Current user and organization. Requires session.

**200**

```json
{
  "user": {
    "id": "…",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "emailVerified": false,
    "image": null,
    "createdAt": "…",
    "updatedAt": "…"
  },
  "organization": {
    "id": "org_…",
    "name": "Analytical Engines",
    "slug": "analytical-engines-x1y2z3",
    "timezone": "UTC",
    "currency": "USD",
    "locale": "en-US",
    "dateFormat": "medium",
    "weekStartsOn": 1,
    "fiscalYearStartMonth": 1
  },
  "role": "owner"
}
```

**401**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Not authenticated"
  }
}
```

---

### `POST /api/onboarding`

Creates an organization + default pipeline for a signed-in user who has no membership yet. Used after register.

**Body**

```json
{ "organizationName": "Acme Inc" }
```

**200**

```json
{ "organizationId": "org_…", "slug": "acme-inc-…" }
```

---

### `GET /api/v1/contacts/export`

Download all organization contacts. Requires session.

**Query**

| Param | Values | Default |
|-------|--------|---------|
| `format` | `csv`, `tsv`, `json`, `vcf`, `xlsx` | `csv` |

**200** — file attachment (`Content-Disposition: attachment`, `Cache-Control: no-store`)

See [contacts-import-export.md](./contacts-import-export.md).

---

### Better Auth — `/api/auth/*`

Handled by [Better Auth](https://www.better-auth.com). Includes email/password sign-up, sign-in, session, change password, and sign-out.

The web app uses the Better Auth React client (`lib/auth-client.ts`).

## Server Actions

Most CRM mutations (companies, contacts, deals, enquiries, quotes, activities, settings, account) are **Next.js Server Actions** in `lib/actions/`. They are not versioned REST resources yet. Prefer them from the first-party UI; for external automation, wait for API tokens or contribute REST routes.

## Error shape (v1)

```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "Human-readable message"
  }
}
```

## CORS

Not configured for arbitrary origins. Same-origin browser use is the supported model today.
