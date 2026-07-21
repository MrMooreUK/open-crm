"use server";

import { and, asc, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { activities } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";
import { validateOptionalCrmLinks } from "@/lib/tenant";
import { activitySchema } from "@/lib/validations";

function revalidateRelated(data: {
  companyId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
}) {
  revalidatePath("/tasks");
  revalidatePath("/");
  if (data.companyId) revalidatePath(`/companies/${data.companyId}`);
  if (data.contactId) revalidatePath(`/contacts/${data.contactId}`);
  if (data.dealId) revalidatePath(`/deals/${data.dealId}`);
}

export async function listActivitiesFor(params: {
  companyId?: string;
  contactId?: string;
  dealId?: string;
}) {
  const { organizationId } = await requireMembership();
  const conditions = [eq(activities.organizationId, organizationId)];
  if (params.companyId) conditions.push(eq(activities.companyId, params.companyId));
  if (params.contactId) conditions.push(eq(activities.contactId, params.contactId));
  if (params.dealId) conditions.push(eq(activities.dealId, params.dealId));

  return db.query.activities.findMany({
    where: and(...conditions),
    orderBy: [desc(activities.createdAt)],
    with: { createdBy: true },
  });
}

export async function listOpenTasks() {
  const { organizationId } = await requireMembership();
  return db.query.activities.findMany({
    where: and(
      eq(activities.organizationId, organizationId),
      eq(activities.type, "task"),
      isNull(activities.completedAt)
    ),
    orderBy: [asc(activities.dueAt), desc(activities.createdAt)],
    with: {
      company: true,
      contact: true,
      deal: true,
      createdBy: true,
    },
  });
}

export async function createActivity(formData: FormData) {
  const { organizationId, user } = await requireMembership();
  const parsed = activitySchema.safeParse({
    type: formData.get("type") || "note",
    body: formData.get("body"),
    dueAt: formData.get("dueAt") || "",
    companyId: formData.get("companyId") || "",
    contactId: formData.get("contactId") || "",
    dealId: formData.get("dealId") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const links = await validateOptionalCrmLinks({
    organizationId,
    companyId: parsed.data.companyId || null,
    contactId: parsed.data.contactId || null,
    dealId: parsed.data.dealId || null,
  });
  if ("error" in links) return links;

  const id = createId("act");
  await db.insert(activities).values({
    id,
    organizationId,
    type: parsed.data.type,
    body: parsed.data.body,
    dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
    companyId: parsed.data.companyId || null,
    contactId: parsed.data.contactId || null,
    dealId: parsed.data.dealId || null,
    createdById: user.id,
  });

  revalidateRelated(parsed.data);
  return { id };
}

export async function completeTask(id: string, completed: boolean) {
  const { organizationId } = await requireMembership();
  await db
    .update(activities)
    .set({
      completedAt: completed ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(
      and(eq(activities.id, id), eq(activities.organizationId, organizationId))
    );
  revalidatePath("/tasks");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteActivity(id: string) {
  const { organizationId } = await requireMembership();
  const existing = await db.query.activities.findFirst({
    where: and(
      eq(activities.id, id),
      eq(activities.organizationId, organizationId)
    ),
  });
  if (!existing) return { error: "Not found" };

  await db
    .delete(activities)
    .where(
      and(eq(activities.id, id), eq(activities.organizationId, organizationId))
    );
  revalidateRelated(existing);
  return { ok: true };
}
