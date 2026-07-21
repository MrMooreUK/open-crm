# Roadmap

Status of open-crm relative to the product plan. Dates are aspirational, not commitments.

## Shipped (0.1 → current main)

- [x] Auth + organization bootstrap  
- [x] Companies, contacts, deals  
- [x] Pipeline Kanban (assignee avatars)  
- [x] Deal stage breadcrumb on deal detail  
- [x] Activities & tasks  
- [x] Search & dashboard  
- [x] Invites & roles  
- [x] Regional org settings  
- [x] Company profile, branding/logo, quote footer  
- [x] User account settings (avatar upload, password, sessions)  
- [x] Default avatar + header profile photo  
- [x] Teal brand identity (tokens, logo mark, primary actions)  
- [x] Quick-add contacts / company picker  
- [x] Contact import/export (CSV, TSV, JSON, vCard, Excel)  
- [x] Enquiries (inbound requests) + assignment  
- [x] Quotes with line items + printable PDF view  
- [x] Services catalog for quoting  
- [x] Shared data tables (filters, columns, bulk delete)  
- [x] Company → contact cascading selects  
- [x] New-enquiry notifications (header + nav badge)  
- [x] Docker Compose install (hardened defaults)  
- [x] AGPL-3.0 + contributing / security docs  

## Next (0.2)

- [ ] Company import / export  
- [ ] Keyboard shortcuts (create, search, board)  
- [ ] Saved views / more list power features  
- [ ] Activity reminders (due tasks surfacing)  
- [ ] More complete REST API for core entities  
- [ ] Optional “mark enquiries seen” / read state for notifications  
- [ ] Click stage breadcrumb to move deal (with confirm)  

## Later (0.3+)

- [ ] API tokens & webhooks (deal stage changes)  
- [ ] Custom fields  
- [ ] Basic automations (“when Won → create task”)  
- [ ] Reports (win rate, pipeline by stage)  
- [ ] Optional OAuth login (Google)  
- [ ] Outbound email via SMTP  

## Explicit non-goals (for now)

- Full marketing automation / bulk email platform  
- Dialer / call recording  
- Complex CPQ  
- Native mobile apps  
- Multi-workspace UX as a product surface  

## How to influence the roadmap

Open an issue with the `enhancement` label, or a discussion. PRs that match **Next (0.2)** items are especially welcome.
