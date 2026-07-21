# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `0.x` (`main`) | Yes |

Security fixes land on `main` first.

## Reporting a vulnerability

**Please do not open a public GitHub issue for security problems.**

Preferred options:

1. **GitHub Security Advisories**  
   https://github.com/MrMooreUK/open-crm/security/advisories/new  

2. **Email** the maintainers (see the GitHub profile for the primary owner) with:
   - Description of the issue  
   - Steps to reproduce  
   - Impact assessment  
   - Any suggested fix  

We aim to acknowledge reports within **72 hours** and keep you updated on remediation.

## Safe harbor

We welcome good-faith research. Do not:

- Access or modify other users’ data  
- Disrupt production services you do not own  
- Publicly disclose before a fix is available (coordinated disclosure preferred)

## Security baseline (project)

| Area | Approach |
|------|----------|
| Passwords | Better Auth (hashed; change-password requires current password) |
| Sessions | HTTP-only session cookies; account page can list/revoke sessions |
| Multi-tenancy | CRM queries scoped by `organization_id` via `requireMembership()` |
| Secrets | Environment variables only — never commit `.env` |
| Uploads | Stored under `public/uploads` (gitignored); **session required** to fetch |
| Health | `/api/health` is unauthenticated and returns only ok/down — no secrets |
| Dependencies | CI on pull requests |

## Self-host checklist

1. Set a unique `BETTER_AUTH_SECRET` (32+ random characters)  
2. Set `BETTER_AUTH_URL` / `APP_URL` to your real public origin (HTTPS in production)  
3. Do **not** expose Postgres to the public internet (Compose binds `127.0.0.1:5432` by default)  
4. Change the default Postgres password for shared hosts  
5. Keep `.env`, backups, and `uploads` volumes private  
6. Terminate TLS at a reverse proxy or load balancer  
7. Apply OS and container updates regularly  

## What is not in this repository

- Real `.env` files or production secrets  
- User-uploaded logos or avatars (`public/uploads/**` is ignored)  
- Private keys, tokens, or customer data  

If you find any of the above in a clone or PR, treat it as an incident: rotate credentials and notify maintainers.

If you find a gap in the baseline, report it privately—thank you.
