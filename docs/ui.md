# UI & brand

open-crm stays **minimal and dense**, with a restrained **teal brand** for identity and primary actions—not a marketing-site redesign.

## Brand tokens

Defined in `app/globals.css` and exposed to Tailwind as:

| Token | Role |
|-------|------|
| `brand` | Primary actions, active emphasis (`#0f766e`) |
| `brand-hover` / `brand-active` | Button hover / press |
| `brand-foreground` | Text on brand fills |
| `brand-muted` / `brand-subtle` | Soft backgrounds (nav active, auth wash) |
| `brand-border` | Soft rings and dividers |

Neutrals remain **zinc** for body text, chrome, and tables.

### Primary CTAs

- Prefer `<Button>` (default variant uses brand).
- Link-as-button patterns use `.btn-primary` / `.btn-primary-sm` (see `globals.css`).

### Logo

- `BrandMark` / `BrandWordmark` in `components/ui/brand-mark.tsx`
- Used in sidebar and auth screens

## Layout chrome

| Surface | Treatment |
|---------|-----------|
| Sidebar | Light brand gradient wash; active items use brand ring/text |
| Header | Avatar + name → `/account`; notification bell |
| Page header | Short brand accent bar above the title |
| Auth | Soft teal/cyan gradient backdrop |

## Shared patterns

### Data tables (`components/data-table/*`)

- Search, column filters, show/hide + drag reorder (prefs in `localStorage`)
- Bulk select + bulk actions (delete on all main lists)
- Wire delete with `makeBulkDeleteAction` + a server `deleteMany(ids)` action

### Avatars (`UserAvatar`, `lib/avatar.ts`)

- Uploaded image when set
- Fallback: `/default-avatar.svg` (public static asset)
- Header, pipeline cards, account page

### Forms

- `SearchableSelect` for companies, contacts, enquiries, deals, services
- Company → contact cascade via `lib/crm-links.ts`
- Org settings forms use password-manager ignore attrs

### Deal stage breadcrumb

On deal detail (`DealStageBreadcrumb`):

```
Pipeline → Lead → Qualified → [Proposal] → …
```

Past stages show a check; current stage is highlighted (Won/Lost use green/red).

### Notifications

Enquiries with status `new` drive:

- Header bell + count badge
- Sidebar Sales / Enquiries badges

## Conventions for contributors

1. Do **not** reintroduce pure black primary buttons (`bg-zinc-900`) for main CTAs—use brand tokens.  
2. Keep decoration minimal: one accent, not multi-colour dashboards.  
3. Prefer existing `components/ui/*` primitives.  
4. Dense tables and short copy over empty marketing chrome.  
