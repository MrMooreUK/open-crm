"use server";

import { and, desc, eq, ilike, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";
import { enquirySchema } from "@/lib/validations";
import { resolveAssigneeId } from "@/lib/team";

export async function listEnquiries(query?: string) {
  const { organizationId } = await requireMembership();
  const conditions = [eq(enquiries.organizationId, organizationId)];
  if (query?.trim()) {
    conditions.push(
      or(
        ilike(enquiries.title, `%${query}%`),
        ilike(enquiries.contactName, `%${query}%`),
        ilike(enquiries.contactEmail, `%${query}%`)
      )!
    );
  }
  return db.query.enquiries.findMany({
    where: and(...conditions),
    orderBy: [desc(enquiries.updatedAt)],
    with: {
      company: true,
      contact: true,
      quotes: true,
      owner: true,
    },
  });
}

export async function getEnquiry(id: string) {
  const { organizationId } = await requireMembership();
  return db.query.enquiries.findFirst({
    where: and(
      eq(enquiries.id, id),
      eq(enquiries.organizationId, organizationId)
    ),
    with: {
      company: true,
      contact: true,
      deal: true,
      owner: true,
      quotes: {
        orderBy: (q, { desc: d }) => [d(q.createdAt)],
      },
    },
  });
}

function parseEnquiryForm(formData: FormData) {
  return enquirySchema.safeParse({
    title: formData.get("title"),
    status: formData.get("status") || "new",
    source: formData.get("source") || "other",
    message: formData.get("message") || "",
    contactName: formData.get("contactName") || "",
    contactEmail: formData.get("contactEmail") || "",
    contactPhone: formData.get("contactPhone") || "",
    companyId: formData.get("companyId") || "",
    contactId: formData.get("contactId") || "",
    ownerId: formData.get("ownerId") || "",
  });
}

export async function createEnquiry(formData: FormData) {
  const { organizationId, user } = await requireMembership();
  const parsed = parseEnquiryForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ownerId = await resolveAssigneeId(
    organizationId,
    parsed.data.ownerId || user.id,
    user.id
  );

  const id = createId("enq");
  await db.insert(enquiries).values({
    id,
    organizationId,
    title: parsed.data.title,
    status: parsed.data.status,
    source: parsed.data.source,
    message: parsed.data.message || null,
    contactName: parsed.data.contactName || null,
    contactEmail: parsed.data.contactEmail || null,
    contactPhone: parsed.data.contactPhone || null,
    companyId: parsed.data.companyId || null,
    contactId: parsed.data.contactId || null,
    ownerId,
  });

  revalidatePath("/enquiries");
  revalidatePath("/");
  return { id };
}

export async function updateEnquiry(id: string, formData: FormData) {
  const { organizationId, user } = await requireMembership();
  const parsed = parseEnquiryForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ownerId = await resolveAssigneeId(
    organizationId,
    parsed.data.ownerId || null,
    user.id
  );

  await db
    .update(enquiries)
    .set({
      title: parsed.data.title,
      status: parsed.data.status,
      source: parsed.data.source,
      message: parsed.data.message || null,
      contactName: parsed.data.contactName || null,
      contactEmail: parsed.data.contactEmail || null,
      contactPhone: parsed.data.contactPhone || null,
      companyId: parsed.data.companyId || null,
      contactId: parsed.data.contactId || null,
      ownerId,
      updatedAt: new Date(),
    })
    .where(
      and(eq(enquiries.id, id), eq(enquiries.organizationId, organizationId))
    );

  revalidatePath("/enquiries");
  revalidatePath(`/enquiries/${id}`);
  return { ok: true };
}

export async function deleteEnquiry(id: string) {
  const { organizationId } = await requireMembership();
  await db
    .delete(enquiries)
    .where(
      and(eq(enquiries.id, id), eq(enquiries.organizationId, organizationId))
    );
  revalidatePath("/enquiries");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteEnquiries(ids: string[]) {
  const { organizationId } = await requireMembership();
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return { error: "Nothing selected" };

  await db
    .delete(enquiries)
    .where(
      and(
        eq(enquiries.organizationId, organizationId),
        inArray(enquiries.id, unique)
      )
    );

  revalidatePath("/enquiries");
  revalidatePath("/");
  return { ok: true as const, deleted: unique.length };
}

export async function updateEnquiryStatus(
  id: string,
  status: "new" | "in_progress" | "quoted" | "won" | "lost" | "closed"
) {
  const { organizationId } = await requireMembership();
  await db
    .update(enquiries)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(enquiries.id, id), eq(enquiries.organizationId, organizationId))
    );
  revalidatePath("/enquiries");
  revalidatePath(`/enquiries/${id}`);
  return { ok: true };
}

/** Quick-assign lead to a teammate (or unassign with empty id) */
export async function assignEnquiry(id: string, ownerId: string) {
  const { organizationId } = await requireMembership();
  const { listTeamMembers } = await import("@/lib/team");

  let finalOwner: string | null = null;
  if (ownerId) {
    const team = await listTeamMembers();
    if (!team.some((m) => m.userId === ownerId)) {
      return { error: "Person is not on your team" };
    }
    finalOwner = ownerId;
  }

  await db
    .update(enquiries)
    .set({ ownerId: finalOwner, updatedAt: new Date() })
    .where(
      and(eq(enquiries.id, id), eq(enquiries.organizationId, organizationId))
    );

  revalidatePath("/enquiries");
  revalidatePath(`/enquiries/${id}`);
  return { ok: true };
}
