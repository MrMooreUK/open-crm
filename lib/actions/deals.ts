"use server";

import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { deals, pipelines, stages } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";
import { stageBelongsToOrganization, validateOptionalCrmLinks } from "@/lib/tenant";
import { dealSchema } from "@/lib/validations";

export async function listDeals(query?: string) {
  const { organizationId } = await requireMembership();
  const conditions = [eq(deals.organizationId, organizationId)];
  if (query?.trim()) {
    conditions.push(ilike(deals.title, `%${query}%`));
  }
  return db.query.deals.findMany({
    where: and(...conditions),
    orderBy: [desc(deals.updatedAt)],
    with: {
      stage: true,
      company: true,
      contact: true,
    },
  });
}

export async function getDeal(id: string) {
  const { organizationId } = await requireMembership();
  return db.query.deals.findFirst({
    where: and(eq(deals.id, id), eq(deals.organizationId, organizationId)),
    with: {
      stage: true,
      company: true,
      contact: true,
    },
  });
}

export async function getDefaultPipeline() {
  const { organizationId } = await requireMembership();
  const pipeline = await db.query.pipelines.findFirst({
    where: and(
      eq(pipelines.organizationId, organizationId),
      eq(pipelines.isDefault, true)
    ),
    with: {
      stages: {
        orderBy: [asc(stages.position)],
      },
    },
  });
  return pipeline;
}

export async function getPipelineBoard() {
  const { organizationId } = await requireMembership();
  const pipeline = await getDefaultPipeline();
  if (!pipeline) return null;

  const allDeals = await db.query.deals.findMany({
    where: eq(deals.organizationId, organizationId),
    with: {
      company: true,
      contact: true,
      stage: true,
    },
    orderBy: [desc(deals.updatedAt)],
  });

  return {
    pipeline,
    stages: pipeline.stages.map((stage) => ({
      ...stage,
      deals: allDeals.filter((d) => d.stageId === stage.id),
    })),
  };
}

export async function createDeal(formData: FormData) {
  const { organizationId, user } = await requireMembership();
  const parsed = dealSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount") || 0,
    currency: formData.get("currency") || "USD",
    stageId: formData.get("stageId"),
    companyId: formData.get("companyId") || "",
    contactId: formData.get("contactId") || "",
    expectedCloseAt: formData.get("expectedCloseAt") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const stage = await stageBelongsToOrganization(parsed.data.stageId, organizationId);
  if (!stage) return { error: "Stage not found" };

  const links = await validateOptionalCrmLinks({
    organizationId,
    companyId: parsed.data.companyId || null,
    contactId: parsed.data.contactId || null,
  });
  if ("error" in links) return links;

  const id = createId("deal");
  const amountCents = Math.round(Number(parsed.data.amount) * 100);

  await db.insert(deals).values({
    id,
    organizationId,
    title: parsed.data.title,
    amountCents,
    currency: parsed.data.currency,
    stageId: parsed.data.stageId,
    companyId: parsed.data.companyId || null,
    contactId: parsed.data.contactId || null,
    expectedCloseAt: parsed.data.expectedCloseAt
      ? new Date(parsed.data.expectedCloseAt)
      : null,
    notes: parsed.data.notes || null,
    ownerId: user.id,
  });

  revalidatePath("/deals");
  revalidatePath("/pipeline");
  revalidatePath("/");
  return { id };
}

export async function updateDeal(id: string, formData: FormData) {
  const { organizationId } = await requireMembership();
  const parsed = dealSchema.safeParse({
    title: formData.get("title"),
    amount: formData.get("amount") || 0,
    currency: formData.get("currency") || "USD",
    stageId: formData.get("stageId"),
    companyId: formData.get("companyId") || "",
    contactId: formData.get("contactId") || "",
    expectedCloseAt: formData.get("expectedCloseAt") || "",
    notes: formData.get("notes") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const stage = await stageBelongsToOrganization(parsed.data.stageId, organizationId);
  if (!stage) return { error: "Stage not found" };

  const links = await validateOptionalCrmLinks({
    organizationId,
    companyId: parsed.data.companyId || null,
    contactId: parsed.data.contactId || null,
  });
  if ("error" in links) return links;

  const amountCents = Math.round(Number(parsed.data.amount) * 100);

  await db
    .update(deals)
    .set({
      title: parsed.data.title,
      amountCents,
      currency: parsed.data.currency,
      stageId: parsed.data.stageId,
      companyId: parsed.data.companyId || null,
      contactId: parsed.data.contactId || null,
      expectedCloseAt: parsed.data.expectedCloseAt
        ? new Date(parsed.data.expectedCloseAt)
        : null,
      notes: parsed.data.notes || null,
      updatedAt: new Date(),
    })
    .where(and(eq(deals.id, id), eq(deals.organizationId, organizationId)));

  revalidatePath("/deals");
  revalidatePath(`/deals/${id}`);
  revalidatePath("/pipeline");
  return { ok: true };
}

export async function moveDeal(dealId: string, stageId: string) {
  const { organizationId } = await requireMembership();
  const stage = await stageBelongsToOrganization(stageId, organizationId);
  if (!stage) return { error: "Stage not found" };

  await db
    .update(deals)
    .set({ stageId, updatedAt: new Date() })
    .where(
      and(eq(deals.id, dealId), eq(deals.organizationId, organizationId))
    );
  revalidatePath("/pipeline");
  revalidatePath("/deals");
  revalidatePath(`/deals/${dealId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteDeal(id: string) {
  const { organizationId } = await requireMembership();
  await db
    .delete(deals)
    .where(and(eq(deals.id, id), eq(deals.organizationId, organizationId)));
  revalidatePath("/deals");
  revalidatePath("/pipeline");
  revalidatePath("/");
  return { ok: true };
}
