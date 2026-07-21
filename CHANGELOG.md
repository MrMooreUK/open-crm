# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Enquiries** — inbound leads with status, source, assignment, bulk delete
- **Quotes** — multi-line quotes, tax, bill-to, status workflow, print/PDF
- **Services catalog** — reusable rates for quote line items
- **Contact import/export** — CSV, TSV, JSON, vCard, Excel + `GET /api/v1/contacts/export`
- **Organization settings** split under sidebar accordion: profile, branding, regional, team
- **Org branding** — logo upload, company address/tax/footer for quotes
- **User account** (`/account`) — profile photo upload, email/name, password, sessions
- **Default avatar** (`/default-avatar.svg`) when no photo is set
- **Header profile photo** next to name (links to account)
- **Notifications** — red badge + bell for enquiries in status `new`
- **Data tables** — filters, column visibility/reorder, bulk select & delete (all main lists)
- **Company → contact cascade** on deal/enquiry/quote forms
- **Pipeline assignee avatars** on Kanban cards
- **Deal stage breadcrumb** — full stage trail on deal detail (Pipeline → stages)
- **Teal brand identity** — CSS tokens, logo mark, primary buttons, nav accents
- Type-to-search pickers for company/contact/enquiry/deal/service
- Expanded documentation (`docs/ui.md`, install/security/architecture updates)

### Security

- Session required to access `/uploads/*` (logos, avatars)
- Compose binds Postgres to `127.0.0.1` by default
- Stricter `.gitignore` for env files, keys, and user uploads

### Changed

- Primary CTAs use brand teal instead of pure zinc black
- Auth screens use branded gradient backdrop

## [0.1.0] — 2026-07-21

### Added

- Initial open-crm MVP
  - Auth (register / login) and organization bootstrap
  - Companies, contacts, deals with CRUD UIs
  - Pipeline Kanban with drag-and-drop stage moves
  - Activities (note, call, email, meeting, task) and tasks list
  - Global search and home dashboard
  - Team invites (link-based)
  - Organization regional settings (timezone, currency, locale, date format, week start, fiscal year)
  - Quick-add contacts with search-or-create company picker
  - Docker Compose one-command install
  - Drizzle migrations and demo seed script
  - AGPL-3.0 license

[Unreleased]: https://github.com/MrMooreUK/open-crm/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/MrMooreUK/open-crm/releases/tag/v0.1.0
