# UI & brand

open-crm is **minimal and dense**: zinc neutrals, white surfaces, and a restrained **teal** accent for primary actions and identity—not gradients, glassmorphism, or multi-colour icon chrome.

## Design principles

1. **Calm chrome** — sidebar and header are light zinc/white; no dark rainbow nav.  
2. **One accent colour** — teal for primary buttons, logo mark, and active-nav icons.  
3. **Dense lists** — tables first; short copy; avoid decorative empty space.  
4. **Shared patterns** — data-table, searchable selects, avatars—not one-off list UIs.

## Brand tokens

Defined in `app/globals.css` and exposed to Tailwind:

| Token | Role |
|-------|------|
| `brand` | Primary actions (`#0f766e`) |
| `brand-hover` / `brand-active` | Hover / press |
| `brand-foreground` | Text on brand fills |
| `brand-muted` / `brand-subtle` | Soft tints (selection, light fills) |
| `brand-border` | Soft borders when needed |

### Primary CTAs

- Prefer `<Button>` (default variant uses brand).  
- Link-as-button patterns: `.btn-primary` / `.btn-primary-sm` in `globals.css`.  
- Do **not** reintroduce multi-stop indigo/violet gradients for primary actions.

### Logo

- `BrandMark` / `BrandWordmark` — solid teal tile with **OC**  
- Used in sidebar and auth screens  

## Layout chrome

| Surface | Treatment |
|---------|-----------|
| Sidebar | Light zinc (`bg-zinc-50`), collapsible sections, plain links |
| Active nav | White row + light ring; icon tinted brand |
| Header | White bar; search; notification bell; avatar → `/account` |
| Page header | Title + description only (no decorative cards/gradients) |
| Auth | Simple zinc-50 page background + card |
| Main | White content area |

## Shared patterns

### Data tables (`components/data-table/*`)

- Search, column filters, show/hide + drag reorder (`localStorage` prefs)  
- Bulk select + bulk actions (delete on all main lists)  
- Wire delete with `makeBulkDeleteAction` + server `deleteMany(ids)`  

### Avatars (`UserAvatar`, `lib/avatar.ts`)

- Uploaded image when set  
- Fallback: `/default-avatar.svg`  
- Header, pipeline cards, account page  

### Forms

- `SearchableSelect` for companies, contacts, enquiries, deals, services  
- Company → contact cascade via `lib/crm-links.ts`  
- Org settings: password-manager ignore attrs on org profile fields  

### Deal stage breadcrumb

On deal detail (`DealStageBreadcrumb`):

```
Pipeline → Lead → Qualified → [Proposal] → …
```

Past stages show a check; current stage is highlighted (Won/Lost use green/red).

### Notifications

Enquiries with status **`new`**:

- Header bell + count  
- Sidebar Sales / Enquiries badges  

## Conventions for contributors

1. Prefer zinc + teal; avoid rainbow accents and heavy blur/shadow stacks.  
2. Prefer existing `components/ui/*` primitives.  
3. Dense tables and short copy over marketing chrome.  
4. Update this doc and the README when UI patterns change.  
