"use server";

import { and, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { companies, contacts } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";
import { contactSchema } from "@/lib/validations";
import { quickCreateCompany } from "@/lib/actions/companies";
import { companyBelongsToOrganization } from "@/lib/tenant";

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function parseContactForm(formData: FormData) {
  const nameField = String(formData.get("name") || "").trim();
  let firstName = String(formData.get("firstName") || "").trim();
  let lastName = String(formData.get("lastName") || "").trim();

  // Prefer single "name" field when present (simpler UX)
  if (nameField) {
    const split = splitName(nameField);
    firstName = split.firstName;
    lastName = split.lastName;
  }

  return {
    firstName,
    lastName,
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    companyId: String(formData.get("companyId") || "").trim(),
    companyName: String(formData.get("companyName") || "").trim(),
    notes: String(formData.get("notes") || "").trim(),
  };
}

async function resolveCompanyId(params: {
  organizationId: string;
  companyId?: string;
  companyName?: string;
  email?: string;
}) {
  if (params.companyId) {
    const company = await companyBelongsToOrganization(
      params.companyId,
      params.organizationId
    );
    return company ? company.id : null;
  }

  if (params.companyName) {
    const created = await quickCreateCompany(params.companyName);
    if ("error" in created && created.error) return null;
    if ("id" in created) return created.id;
  }

  // Soft match: email domain → existing company domain
  if (params.email?.includes("@")) {
    const domain = params.email.split("@")[1]?.toLowerCase();
    if (
      domain &&
      !["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com", "me.com", "proton.me", "protonmail.com"].includes(
        domain
      )
    ) {
      const match = await db.query.companies.findFirst({
        where: and(
          eq(companies.organizationId, params.organizationId),
          or(
            ilike(companies.domain, domain),
            ilike(companies.website, `%${domain}%`)
          )
        ),
      });
      if (match) return match.id;
    }
  }

  return null;
}

export async function listContacts(query?: string) {
  const { organizationId } = await requireMembership();
  const conditions = [eq(contacts.organizationId, organizationId)];
  if (query?.trim()) {
    conditions.push(
      or(
        ilike(contacts.firstName, `%${query}%`),
        ilike(contacts.lastName, `%${query}%`),
        ilike(contacts.email, `%${query}%`)
      )!
    );
  }
  return db.query.contacts.findMany({
    where: and(...conditions),
    orderBy: [desc(contacts.updatedAt)],
    with: { company: true },
  });
}

export async function getContact(id: string) {
  const { organizationId } = await requireMembership();
  return db.query.contacts.findFirst({
    where: and(
      eq(contacts.id, id),
      eq(contacts.organizationId, organizationId)
    ),
    with: {
      company: true,
      deals: { with: { stage: true } },
    },
  });
}

export async function createContact(formData: FormData) {
  const { organizationId, user } = await requireMembership();
  const raw = parseContactForm(formData);

  const parsed = contactSchema.safeParse({
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phone: raw.phone,
    title: raw.title,
    companyId: raw.companyId,
    notes: raw.notes,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const companyId =
    (await resolveCompanyId({
      organizationId,
      companyId: parsed.data.companyId || undefined,
      companyName: raw.companyName || undefined,
      email: parsed.data.email || undefined,
    })) ?? null;

  const id = createId("ct");
  await db.insert(contacts).values({
    id,
    organizationId,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName || "",
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    title: parsed.data.title || null,
    companyId,
    notes: parsed.data.notes || null,
    ownerId: user.id,
  });

  revalidatePath("/contacts");
  revalidatePath("/");
  if (companyId) {
    revalidatePath(`/companies/${companyId}`);
  }
  return { id, companyId };
}

export async function updateContact(id: string, formData: FormData) {
  const { organizationId } = await requireMembership();
  const raw = parseContactForm(formData);

  const parsed = contactSchema.safeParse({
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    phone: raw.phone,
    title: raw.title,
    companyId: raw.companyId,
    notes: raw.notes,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const companyId =
    (await resolveCompanyId({
      organizationId,
      companyId: parsed.data.companyId || undefined,
      companyName: raw.companyName || undefined,
      email: parsed.data.email || undefined,
    })) ?? null;

  await db
    .update(contacts)
    .set({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || "",
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      title: parsed.data.title || null,
      companyId,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(contacts.id, id), eq(contacts.organizationId, organizationId))
    );

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  if (companyId) revalidatePath(`/companies/${companyId}`);
  return { ok: true };
}

export async function deleteContact(id: string) {
  const { organizationId } = await requireMembership();
  await db
    .delete(contacts)
    .where(
      and(eq(contacts.id, id), eq(contacts.organizationId, organizationId))
    );
  revalidatePath("/contacts");
  revalidatePath("/");
  return { ok: true };
}
