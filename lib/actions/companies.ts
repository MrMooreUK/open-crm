"use server";

import { and, desc, eq, ilike, or } from "drizzle-orm";
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
