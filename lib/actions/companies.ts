"use server";

import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { companies } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";
import { companySchema } from "@/lib/validations";

export async function listCompanies(query?: string) {
  const { organizationId } = await requireMembership();
  const conditions = [eq(companies.organizationId, organizationId)];
  if (query?.trim()) {
    conditions.push(
      or(
        ilike(companies.name, `%${query}%`),
        ilike(companies.domain, `%${query}%`)
      )!
    );
  }
  return db.query.companies.findMany({
    where: and(...conditions),
    orderBy: [desc(companies.updatedAt)],
  });
}

export async function getCompany(id: string) {
  const { organizationId } = await requireMembership();
  return db.query.companies.findFirst({
    where: and(
      eq(companies.id, id),
      eq(companies.organizationId, organizationId)
    ),
    with: {
      contacts: true,
      deals: {
        with: { stage: true },
      },
      enquiries: true,
      quotes: true,
    },
  });
}

export async function createCompany(formData: FormData) {
  const { organizationId, user } = await requireMembership();
  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain") || "",
    industry: formData.get("industry") || "",
    website: formData.get("website") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const id = createId("co");
  await db.insert(companies).values({
    id,
    organizationId,
    name: parsed.data.name,
    domain: parsed.data.domain || null,
    industry: parsed.data.industry || null,
    website: parsed.data.website || null,
    notes: parsed.data.notes || null,
    ownerId: user.id,
  });

  revalidatePath("/companies");
  revalidatePath("/");
  return { id };
}

/** One-field company create for pickers / quick-add flows */
export async function quickCreateCompany(name: string, domain?: string) {
  const { organizationId, user } = await requireMembership();
  const trimmed = name.trim();
  if (!trimmed) return { error: "Company name is required" };

  // Reuse existing company with same name (case-insensitive)
  const existing = await db.query.companies.findFirst({
    where: and(
      eq(companies.organizationId, organizationId),
      ilike(companies.name, trimmed)
    ),
  });
  if (existing) {
    return { id: existing.id, name: existing.name, existing: true as const };
  }

  const id = createId("co");
  await db.insert(companies).values({
    id,
    organizationId,
    name: trimmed,
    domain: domain?.trim() || null,
    ownerId: user.id,
  });

  revalidatePath("/companies");
  revalidatePath("/");
  return { id, name: trimmed, existing: false as const };
}

/** Find company by exact domain or name for smart linking */
export async function findCompanyByDomain(domain: string) {
  const { organizationId } = await requireMembership();
  const d = domain.trim().toLowerCase();
  if (!d) return null;
  return db.query.companies.findFirst({
    where: and(
      eq(companies.organizationId, organizationId),
      or(ilike(companies.domain, d), ilike(companies.website, `%${d}%`))
    ),
  });
}

export async function updateCompany(id: string, formData: FormData) {
  const { organizationId } = await requireMembership();
  const parsed = companySchema.safeParse({
    name: formData.get("name"),
    domain: formData.get("domain") || "",
    industry: formData.get("industry") || "",
    website: formData.get("website") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(companies)
    .set({
      name: parsed.data.name,
      domain: parsed.data.domain || null,
      industry: parsed.data.industry || null,
      website: parsed.data.website || null,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(companies.id, id), eq(companies.organizationId, organizationId))
    );

  revalidatePath("/companies");
  revalidatePath(`/companies/${id}`);
  return { ok: true };
}

export async function deleteCompany(id: string) {
  const { organizationId } = await requireMembership();
  await db
    .delete(companies)
    .where(
      and(eq(companies.id, id), eq(companies.organizationId, organizationId))
    );
  revalidatePath("/companies");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCompanies(ids: string[]) {
  const { organizationId } = await requireMembership();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return { error: "Nothing selected" };

  await db
    .delete(companies)
    .where(
      and(
        eq(companies.organizationId, organizationId),
        inArray(companies.id, unique)
      )
    );

  revalidatePath("/companies");
  revalidatePath("/contacts");
  revalidatePath("/");
  return { ok: true as const, deleted: unique.length };
}
