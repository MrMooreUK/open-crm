# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `0.x` (main) | Yes |

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

- Passwords handled by Better Auth (strong hashing)  
- Session cookies for browser auth  
- Multi-tenant isolation by `organization_id` on CRM queries  
- Secrets via environment variables only (never commit `.env`)  
- Dependency and CI checks on pull requests  

If you find a gap in that baseline, report it privately—thank you.
