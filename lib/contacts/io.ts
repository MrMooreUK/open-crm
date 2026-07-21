/**
 * Contact import/export — multi-format parsers and serializers.
 * Supported: csv, tsv, json, vcf (vCard), xlsx
 */

export type ContactIOFormat = "csv" | "tsv" | "json" | "vcf" | "xlsx";

export type ContactIORow = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  company: string;
  notes: string;
};

export const CONTACT_IO_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "title",
  "company",
  "notes",
] as const;

/** Flexible header aliases → canonical field */
const HEADER_ALIASES: Record<string, keyof ContactIORow> = {
  firstname: "firstName",
  first_name: "firstName",
  "first name": "firstName",
  givenname: "firstName",
  given_name: "firstName",
  given: "firstName",
  fname: "firstName",
  lastname: "lastName",
  last_name: "lastName",
  "last name": "lastName",
  surname: "lastName",
  familyname: "lastName",
  family_name: "lastName",
  lname: "lastName",
  email: "email",
  "e-mail": "email",
  emailaddress: "email",
  "email address": "email",
  mail: "email",
  phone: "phone",
  telephone: "phone",
  mobile: "phone",
  cell: "phone",
  tel: "phone",
  "phone number": "phone",
  title: "title",
  jobtitle: "title",
  "job title": "title",
  position: "title",
  role: "title",
  company: "company",
  organization: "company",
  organisation: "company",
  org: "company",
  account: "company",
  companyname: "company",
  "company name": "company",
  notes: "notes",
  note: "notes",
  comment: "notes",
  comments: "notes",
  description: "notes",
};

export function detectFormat(
  filename: string,
  mimeType?: string,
  contentSample?: string
): ContactIOFormat | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".tsv") || lower.endsWith(".tab")) return "tsv";
  if (lower.endsWith(".json")) return "json";
  if (lower.endsWith(".vcf") || lower.endsWith(".vcard")) return "vcf";
  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) return "xlsx";

  const mime = (mimeType || "").toLowerCase();
  if (mime.includes("csv")) return "csv";
  if (mime.includes("tab-separated")) return "tsv";
  if (mime.includes("json")) return "json";
  if (mime.includes("vcard")) return "vcf";
  if (
    mime.includes("spreadsheet") ||
    mime.includes("excel") ||
    mime.includes("sheet")
  ) {
    return "xlsx";
  }

  const sample = (contentSample || "").trimStart();
  if (sample.startsWith("{") || sample.startsWith("[")) return "json";
  if (sample.toUpperCase().startsWith("BEGIN:VCARD")) return "vcf";
  if (sample.includes("\t") && sample.includes("\n")) return "tsv";
  if (sample.includes(",") && sample.includes("\n")) return "csv";

  return null;
}

export function formatExtension(format: ContactIOFormat): string {
  switch (format) {
    case "csv":
      return "csv";
    case "tsv":
      return "tsv";
    case "json":
      return "json";
    case "vcf":
      return "vcf";
    case "xlsx":
      return "xlsx";
  }
}

export function formatMimeType(format: ContactIOFormat): string {
  switch (format) {
    case "csv":
      return "text/csv;charset=utf-8";
    case "tsv":
      return "text/tab-separated-values;charset=utf-8";
    case "json":
      return "application/json;charset=utf-8";
    case "vcf":
      return "text/vcard;charset=utf-8";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

function emptyRow(): ContactIORow {
  return {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    title: "",
    company: "",
    notes: "",
  };
}

function normalizeHeader(h: string): string {
  return h
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "");
}

function rowFromRecord(record: Record<string, string>): ContactIORow {
  const row = emptyRow();
  let fullNameValue = "";

  for (const [rawKey, rawVal] of Object.entries(record)) {
    const key = normalizeHeader(rawKey);
    const val = String(rawVal ?? "").trim();
    if (!val) continue;

    if (
      key === "name" ||
      key === "fullname" ||
      key === "full name" ||
      key === "contact"
    ) {
      fullNameValue = val;
      continue;
    }

    const field = HEADER_ALIASES[key];
    if (field) {
      row[field] = val;
    }
  }

  if (fullNameValue) {
    if (!row.firstName && !row.lastName) {
      const split = splitName(fullNameValue);
      row.firstName = split.firstName;
      row.lastName = split.lastName;
    } else if (!row.firstName) {
      const split = splitName(fullNameValue);
      row.firstName = split.firstName;
      if (!row.lastName) row.lastName = split.lastName;
    }
  }

  // firstName column sometimes contains full name
  if (row.firstName && !row.lastName && row.firstName.includes(" ")) {
    const split = splitName(row.firstName);
    row.firstName = split.firstName;
    row.lastName = split.lastName;
  }

  return row;
}

function isRowEmpty(row: ContactIORow): boolean {
  return !CONTACT_IO_FIELDS.some((f) => row[f].trim());
}

function isRowValid(row: ContactIORow): boolean {
  return Boolean(row.firstName.trim() || row.email.trim());
}

// ─── Delimited (CSV / TSV) ────────────────────────────────────────────────────

function parseDelimited(text: string, delimiter: "," | "\t"): ContactIORow[] {
  const rows = parseDelimitedMatrix(text, delimiter);
  if (rows.length === 0) return [];

  const headers = rows[0].map(normalizeHeader);
  const out: ContactIORow[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    if (cells.every((c) => !c.trim())) continue;
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = cells[idx] ?? "";
    });
    const row = rowFromRecord(record);
    if (!isRowEmpty(row) && isRowValid(row)) out.push(row);
  }

  return out;
}

/** RFC-style CSV parser with quotes */
function parseDelimitedMatrix(text: string, delimiter: "," | "\t"): string[][] {
  const input = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
  const result: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (ch === '"') {
        if (next === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (ch === "\n") {
      row.push(cell);
      result.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    result.push(row);
  }

  return result.filter((r) => r.some((c) => c.trim() !== ""));
}

function escapeCsvCell(value: string, delimiter: "," | "\t"): string {
  const needsQuotes =
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");
  if (!needsQuotes) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

function serializeDelimited(
  rows: ContactIORow[],
  delimiter: "," | "\t"
): string {
  const headers = [
    "firstName",
    "lastName",
    "email",
    "phone",
    "title",
    "company",
    "notes",
  ];
  const lines = [
    headers.join(delimiter),
    ...rows.map((r) =>
      headers
        .map((h) => escapeCsvCell(r[h as keyof ContactIORow] ?? "", delimiter))
        .join(delimiter)
    ),
  ];
  return lines.join("\n") + "\n";
}

// ─── JSON ─────────────────────────────────────────────────────────────────────

function parseJson(text: string): ContactIORow[] {
  const data = JSON.parse(text) as unknown;
  const list = Array.isArray(data)
    ? data
    : data &&
        typeof data === "object" &&
        Array.isArray((data as { contacts?: unknown }).contacts)
      ? (data as { contacts: unknown[] }).contacts
      : data &&
          typeof data === "object" &&
          Array.isArray((data as { data?: unknown }).data)
        ? (data as { data: unknown[] }).data
        : null;

  if (!list) {
    throw new Error(
      "JSON must be an array of contacts, or { contacts: [...] }"
    );
  }

  const out: ContactIORow[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const rec: Record<string, string> = {};
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      if (v == null) continue;
      rec[k] = String(v);
    }
    const row = rowFromRecord(rec);
    if (!isRowEmpty(row) && isRowValid(row)) out.push(row);
  }
  return out;
}

function serializeJson(rows: ContactIORow[]): string {
  return (
    JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        count: rows.length,
        contacts: rows.map((r) => ({
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email || null,
          phone: r.phone || null,
          title: r.title || null,
          company: r.company || null,
          notes: r.notes || null,
        })),
      },
      null,
      2
    ) + "\n"
  );
}

// ─── vCard ────────────────────────────────────────────────────────────────────

function unfoldVcard(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n[ \t]/g, "");
}

function parseVcard(text: string): ContactIORow[] {
  const unfolded = unfoldVcard(text);
  const blocks = unfolded.split(/BEGIN:VCARD/i).slice(1);
  const out: ContactIORow[] = [];

  for (const block of blocks) {
    const body = block.split(/END:VCARD/i)[0] ?? block;
    const row = emptyRow();

    for (const line of body.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const colon = trimmed.indexOf(":");
      if (colon === -1) continue;
      const rawKey = trimmed.slice(0, colon);
      const value = trimmed.slice(colon + 1).trim();
      const key = rawKey.split(";")[0].toUpperCase();

      if (key === "FN") {
        const split = splitName(value);
        if (!row.firstName) {
          row.firstName = split.firstName;
          row.lastName = split.lastName;
        }
      } else if (key === "N") {
        const parts = value.split(";");
        const family = parts[0] ?? "";
        const given = parts[1] ?? "";
        if (given || family) {
          row.firstName = given || row.firstName;
          row.lastName = family || row.lastName;
        }
      } else if (key === "EMAIL") {
        if (!row.email) row.email = value;
      } else if (key === "TEL") {
        if (!row.phone) row.phone = value;
      } else if (key === "ORG") {
        row.company = value.split(";")[0] ?? value;
      } else if (key === "TITLE" || key === "ROLE") {
        if (!row.title) row.title = value;
      } else if (key === "NOTE") {
        row.notes = value.replace(/\\n/g, "\n").replace(/\\,/g, ",");
      }
    }

    if (!isRowEmpty(row) && isRowValid(row)) out.push(row);
  }

  return out;
}

function escapeVcard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function serializeVcard(rows: ContactIORow[]): string {
  return (
    rows
      .map((r) => {
        const fn = [r.firstName, r.lastName].filter(Boolean).join(" ").trim();
        const lines = [
          "BEGIN:VCARD",
          "VERSION:3.0",
          `N:${escapeVcard(r.lastName)};${escapeVcard(r.firstName)};;;`,
          `FN:${escapeVcard(fn || r.email || "Unknown")}`,
        ];
        if (r.email) lines.push(`EMAIL;TYPE=INTERNET:${escapeVcard(r.email)}`);
        if (r.phone) lines.push(`TEL;TYPE=CELL:${escapeVcard(r.phone)}`);
        if (r.company) lines.push(`ORG:${escapeVcard(r.company)}`);
        if (r.title) lines.push(`TITLE:${escapeVcard(r.title)}`);
        if (r.notes) lines.push(`NOTE:${escapeVcard(r.notes)}`);
        lines.push("END:VCARD");
        return lines.join("\r\n");
      })
      .join("\r\n") + "\r\n"
  );
}

// ─── Excel ────────────────────────────────────────────────────────────────────

async function parseXlsx(
  buffer: ArrayBuffer | Buffer
): Promise<ContactIORow[]> {
  const XLSX = await import("xlsx");
  const data =
    buffer instanceof ArrayBuffer
      ? new Uint8Array(buffer)
      : new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  const out: ContactIORow[] = [];
  for (const item of json) {
    const rec: Record<string, string> = {};
    for (const [k, v] of Object.entries(item)) {
      rec[k] = String(v ?? "");
    }
    const row = rowFromRecord(rec);
    if (!isRowEmpty(row) && isRowValid(row)) out.push(row);
  }
  return out;
}

async function serializeXlsx(rows: ContactIORow[]): Promise<Uint8Array> {
  const XLSX = await import("xlsx");
  const data = rows.map((r) => ({
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    phone: r.phone,
    title: r.title,
    company: r.company,
    notes: r.notes,
  }));
  const sheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Contacts");
  const out = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
  return new Uint8Array(out as ArrayBuffer);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type ParseResult = {
  rows: ContactIORow[];
  format: ContactIOFormat;
};

export async function parseContactsFile(params: {
  filename: string;
  mimeType?: string;
  text?: string;
  buffer?: ArrayBuffer | Buffer;
}): Promise<ParseResult> {
  const format = detectFormat(
    params.filename,
    params.mimeType,
    params.text?.slice(0, 200)
  );

  if (!format) {
    throw new Error(
      "Unsupported file type. Use CSV, TSV, JSON, vCard (.vcf), or Excel (.xlsx)."
    );
  }

  let rows: ContactIORow[] = [];

  if (format === "xlsx") {
    if (!params.buffer) {
      throw new Error("Excel import requires a binary file upload.");
    }
    rows = await parseXlsx(params.buffer);
  } else {
    const text = params.text;
    if (text == null) {
      throw new Error("Text content required for this format.");
    }
    switch (format) {
      case "csv":
        rows = parseDelimited(text, ",");
        break;
      case "tsv":
        rows = parseDelimited(text, "\t");
        break;
      case "json":
        rows = parseJson(text);
        break;
      case "vcf":
        rows = parseVcard(text);
        break;
    }
  }

  return { rows, format };
}

export async function serializeContacts(
  rows: ContactIORow[],
  format: ContactIOFormat
): Promise<{ body: string | Uint8Array; mime: string; extension: string }> {
  const mime = formatMimeType(format);
  const extension = formatExtension(format);

  switch (format) {
    case "csv":
      return { body: serializeDelimited(rows, ","), mime, extension };
    case "tsv":
      return { body: serializeDelimited(rows, "\t"), mime, extension };
    case "json":
      return { body: serializeJson(rows), mime, extension };
    case "vcf":
      return { body: serializeVcard(rows), mime, extension };
    case "xlsx":
      return { body: await serializeXlsx(rows), mime, extension };
  }
}

export const IMPORT_ACCEPT =
  ".csv,.tsv,.tab,.json,.vcf,.vcard,.xlsx,.xls,text/csv,text/tab-separated-values,application/json,text/vcard,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel";

export const FORMAT_LABELS: Record<ContactIOFormat, string> = {
  csv: "CSV",
  tsv: "TSV",
  json: "JSON",
  vcf: "vCard",
  xlsx: "Excel",
};
