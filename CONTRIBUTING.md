# Contributing to open-crm

Thanks for helping make open-crm better. This guide keeps collaboration simple.

## Ways to contribute

- Report bugs and propose features (GitHub Issues)
- Improve docs, typos, and examples
- Fix bugs and ship small UX improvements
- Add tests and CI hardening

For large features, open an issue first so we can align on design.

## Development setup

```bash
git clone https://github.com/MrMooreUK/open-crm.git
cd open-crm
cp .env.example .env
docker compose up -d db
npm install
npm run db:migrate
npm run dev
```

App: http://localhost:3000  

See [docs/development.md](./docs/development.md) for conventions.

## Pull request process

1. Fork the repo and create a branch from `main`  
   - `fix/short-description`  
   - `feat/short-description`  
   - `docs/short-description`
2. Keep changes focused—one concern per PR when possible.
3. Run checks locally:
   ```bash
   npx tsc --noEmit
   npm run lint
   npm run build
   ```
4. Update docs if you change behavior, env vars, or install steps.
5. Open a PR against `main` with a clear description of *what* and *why*.

## Code guidelines

- **TypeScript** throughout; prefer explicit types on public boundaries.
- **Server actions** for form mutations; keep DB access org-scoped (`organizationId`).
- **UI** stays minimal: zinc neutrals, dense tables, no decorative clutter.
- **Migrations** via Drizzle (`npm run db:generate`)—never edit applied SQL casually.
- Avoid new heavy dependencies unless the benefit is clear.

## Commit messages

Use short, imperative subjects:

```
feat: add CSV export for contacts
fix: prevent deal move without stage access
docs: clarify Docker production secrets
```

## Issue labels (maintainers)

| Label | Meaning |
|-------|---------|
| `good first issue` | Friendly for new contributors |
| `bug` | Something broken |
| `enhancement` | New capability |
| `docs` | Documentation only |
| `help wanted` | Extra hands appreciated |

## License

By contributing, you agree that your contributions are licensed under the **AGPL-3.0** license of this project.

## Questions?

Open a [Discussion](https://github.com/MrMooreUK/open-crm/discussions) or an issue. Be kind—see [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).
