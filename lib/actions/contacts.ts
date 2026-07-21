"use server";

import { and, desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { contacts } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";
import { contactSchema } from "@/lib/validations";

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
  const parsed = contactSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    title: formData.get("title") || "",
    companyId: formData.get("companyId") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const id = createId("ct");
  await db.insert(contacts).values({
    id,
    organizationId,
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName || "",
    email: parsed.data.email || null,
    phone: parsed.data.phone || null,
    title: parsed.data.title || null,
    companyId: parsed.data.companyId || null,
    notes: parsed.data.notes || null,
    ownerId: user.id,
  });

  revalidatePath("/contacts");
  revalidatePath("/");
  if (parsed.data.companyId) {
    revalidatePath(`/companies/${parsed.data.companyId}`);
  }
  return { id };
}

export async function updateContact(id: string, formData: FormData) {
  const { organizationId } = await requireMembership();
  const parsed = contactSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    title: formData.get("title") || "",
    companyId: formData.get("companyId") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(contacts)
    .set({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName || "",
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      title: parsed.data.title || null,
      companyId: parsed.data.companyId || null,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(contacts.id, id), eq(contacts.organizationId, organizationId))
    );

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
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
