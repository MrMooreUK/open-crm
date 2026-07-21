"use server";

import { and, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { companies, contacts } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";
import {
  type ContactIOFormat,
  type ContactIORow,
  parseContactsFile,
} from "@/lib/contacts/io";

const MAX_IMPORT_ROWS = 5000;
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

export type ImportContactsResult = {
  created: number;
  skipped: number;
  companiesCreated: number;
  format: ContactIOFormat;
  errors: string[];
};

async function resolveCompanyIdCached(
  organizationId: string,
  userId: string,
  companyName: string,
  cache: Map<string, string>
): Promise<{ id: string | null; created: boolean }> {
  const name = companyName.trim();
  if (!name) return { id: null, created: false };

  const key = name.toLowerCase();
  const cached = cache.get(key);
  if (cached) return { id: cached, created: false };

  const existing = await db.query.companies.findFirst({
    where: and(
      eq(companies.organizationId, organizationId),
      ilike(companies.name, name)
    ),
  });

  if (existing) {
    cache.set(key, existing.id);
    return { id: existing.id, created: false };
  }

  const id = createId("co");
  await db.insert(companies).values({
    id,
    organizationId,
    name,
    ownerId: userId,
  });
  cache.set(key, id);
  return { id, created: true };
}

export async function importContactsFromForm(
  formData: FormData
): Promise<ImportContactsResult | { error: string }> {
  const { organizationId, user } = await requireMembership();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Choose a file to import." };
  }
  if (file.size === 0) {
    return { error: "The file is empty." };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "File is too large (max 5 MB)." };
  }

  const filename = file.name || "upload";
  const mimeType = file.type || undefined;
  const lower = filename.toLowerCase();
  const isExcel = lower.endsWith(".xlsx") || lower.endsWith(".xls");

  let rows: ContactIORow[];
  let format: ContactIOFormat;

  try {
    if (isExcel) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const parsed = await parseContactsFile({
        filename,
        mimeType,
        buffer,
      });
      rows = parsed.rows;
      format = parsed.format;
    } else {
      const text = await file.text();
      const parsed = await parseContactsFile({
        filename,
        mimeType,
        text,
      });
      rows = parsed.rows;
      format = parsed.format;
    }
  } catch (e) {
    return {
      error: e instanceof Error ? e.message : "Could not parse the file.",
    };
  }

  if (rows.length === 0) {
    return {
      error:
        "No valid contacts found. Include a header row and at least a name or email.",
    };
  }

  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      error: `Too many rows (${rows.length}). Maximum is ${MAX_IMPORT_ROWS} per import.`,
    };
  }

  const companyCache = new Map<string, string>();
  let created = 0;
  let skipped = 0;
  let companiesCreated = 0;
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const line = i + 2; // approximate (header + 1-based)

    try {
      let firstName = row.firstName.trim();
      const lastName = row.lastName.trim();
      const email = row.email.trim() || null;

      if (!firstName && email) {
        firstName = email.split("@")[0] || "Contact";
      }
      if (!firstName) {
        skipped++;
        continue;
      }

      const { id: companyId, created: coCreated } =
        await resolveCompanyIdCached(
          organizationId,
          user.id,
          row.company,
          companyCache
        );
      if (coCreated) companiesCreated++;

      // Skip exact email duplicates within org
      if (email) {
        const dup = await db.query.contacts.findFirst({
          where: and(
            eq(contacts.organizationId, organizationId),
            eq(contacts.email, email)
          ),
        });
        if (dup) {
          skipped++;
          continue;
        }
      }

      await db.insert(contacts).values({
        id: createId("ct"),
        organizationId,
        firstName,
        lastName,
        email,
        phone: row.phone.trim() || null,
        title: row.title.trim() || null,
        companyId,
        notes: row.notes.trim() || null,
        ownerId: user.id,
      });
      created++;
    } catch (e) {
      skipped++;
      if (errors.length < 10) {
        errors.push(
          `Row ${line}: ${e instanceof Error ? e.message : "failed"}`
        );
      }
    }
  }

  revalidatePath("/contacts");
  revalidatePath("/companies");
  revalidatePath("/");

  return {
    created,
    skipped,
    companiesCreated,
    format,
    errors,
  };
}

/** Sample template content for download (CSV). */
export async function getContactImportTemplate(): Promise<string> {
  await requireMembership();
  return (
    [
      "firstName,lastName,email,phone,title,company,notes",
      "Jane,Buyer,jane@acme.com,+1 555 0100,VP Sales,Acme Corp,Met at conference",
      "Sam,Decision,sam@globex.io,,CTO,Globex,",
    ].join("\n") + "\n"
  );
}
