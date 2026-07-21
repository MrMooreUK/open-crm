# Contact import & export

open-crm can move contacts in and out of the workspace in several formats.

## Formats

| Format | Extension | Import | Export | Notes |
|--------|-----------|--------|--------|-------|
| CSV | `.csv` | ✓ | ✓ | Header row required; flexible column names |
| TSV | `.tsv`, `.tab` | ✓ | ✓ | Same columns as CSV, tab-separated |
| JSON | `.json` | ✓ | ✓ | Array, or `{ "contacts": [ ... ] }` |
| vCard | `.vcf`, `.vcard` | ✓ | ✓ | vCard 3.0 (`FN`, `N`, `EMAIL`, `TEL`, `ORG`, `TITLE`, `NOTE`) |
| Excel | `.xlsx` | ✓ | ✓ | First worksheet; header row in row 1 |

## Where in the UI

**Contacts** page → **Import** / **Export**

- Export downloads via `GET /api/v1/contacts/export?format=csv|tsv|json|vcf|xlsx`
- Import uploads a file (max **5 MB**, max **5,000** rows per file)

## Column mapping (CSV / TSV / Excel / JSON)

Headers are matched case-insensitively. Common aliases:

| Field | Accepted headers |
|-------|------------------|
| First name | `firstName`, `First Name`, `given_name`, `fname`, … |
| Last name | `lastName`, `Last Name`, `surname`, … |
| Full name | `Name`, `Full Name` (split on first space) |
| Email | `email`, `E-mail`, `Email Address`, … |
| Phone | `phone`, `mobile`, `tel`, … |
| Title | `title`, `Job Title`, `position`, … |
| Company | `company`, `Organization`, `org`, … |
| Notes | `notes`, `comment`, `description`, … |

A row is imported if it has a **name** and/or **email**.

## Import behavior

1. Parse file and normalize rows  
2. For each company name: find existing (case-insensitive) or **create**  
3. Skip rows whose **email** already exists in the organization  
4. Create contacts owned by the current user  

A CSV template is available from the Import dialog (“Download CSV template”).

## Export

Exports all contacts in the current organization, including company name (not company id).

Example:

```bash
curl -OJ -b 'cookies.txt' \
  'http://localhost:3000/api/v1/contacts/export?format=json'
```

(Browser session cookie required.)

## Limits

| Limit | Value |
|-------|-------|
| Max file size | 5 MB |
| Max rows per import | 5,000 |
| Excel | First sheet only |

## Programmatic notes

- Parsers/serializers: `lib/contacts/io.ts`  
- Import server action: `importContactsFromForm` in `lib/actions/contact-io.ts`  
- Export route: `app/api/v1/contacts/export/route.ts`  
