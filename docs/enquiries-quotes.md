# Enquiries & quotes

## Enquiries

Inbound requests before (or alongside) a pipeline deal.

| Field | Description |
|-------|-------------|
| Subject | Short title |
| Status | `new` → `in_progress` → `quoted` → `won` / `lost` / `closed` |
| Source | web, email, phone, referral, other |
| Contact fields | Name, email, phone (even without a CRM contact) |
| Links | Optional company, contact, and generated quotes |
| Assignee | Team member responsible for the lead |

**UI:** sidebar → **Sales → Enquiries**

### Notifications

Enquiries with status **`new`** drive the red badge on:

- Header **bell** (dropdown of recent new enquiries)  
- Sidebar **Sales** / **Enquiries**  

Changing status away from `new` clears that item from the count after the next navigation/refresh.

### Forms

Selecting a **company** filters the contact list to people at that company. Selecting a contact can fill company and contact fields.

From an enquiry detail page, click **Generate quote** to pre-fill bill-to and linkage.

## Quotes

Commercial documents with line items.

| Field | Description |
|-------|-------------|
| Number | Auto `Q-YYYY-0001` per organization |
| Status | draft, sent, accepted, rejected, expired |
| Lines | Description, quantity, unit price |
| Tax | Percentage applied to subtotal |
| Bill to | Name, email, company, address (snapshot) |
| Links | Optional enquiry, deal, company, contact |

### Services catalog

**Quotes → Services** holds reusable priced offerings (unit, currency). Add a service line on a quote form to drop in description and unit price.

### Print / PDF

Open **Print / PDF** on a quote detail page (`/quotes/[id]/print`).

Use your browser’s **Print → Save as PDF**.

Org **logo** and company profile fields appear on printed quotes when configured under **Organization → Branding / Profile**.

### Workflow tips

1. Log an **enquiry** when a request arrives  
2. **Generate quote** with line items and tax (use services when applicable)  
3. **Mark sent** when shared with the customer  
4. **Accept** / **Reject** when they decide  
5. Optionally link a **deal** in the pipeline for the same opportunity  

## Data model

```
enquiries → quotes → quote_items
         ↘ deals (optional)
services  → used when building quote lines
organization branding → quote print header/footer
```

## Bulk actions

Enquiries and quotes lists support multi-select and bulk delete (same data-table pattern as contacts/deals/companies).

## Related: deals

On a **deal detail** page, a **stage breadcrumb** shows the full pipeline path
(e.g. Pipeline → Lead → Qualified → **Proposal** → …) so the current stage is
obvious without opening the Kanban board. See [ui.md](./ui.md).
