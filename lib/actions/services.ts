"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { requireMembership } from "@/lib/session";

const serviceSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  unitPrice: z.coerce.number().min(0).default(0),
  unit: z
    .enum(["hour", "day", "item", "project", "month"])
    .default("item"),
  currency: z.string().length(3).default("USD"),
  isActive: z
    .union([z.boolean(), z.string()])
    .transform((v) => v === true || v === "true" || v === "on")
    .default(true),
});

export async function listServices(opts?: { activeOnly?: boolean }) {
  const { organizationId } = await requireMembership();
  const conditions = [eq(services.organizationId, organizationId)];
  if (opts?.activeOnly) {
    conditions.push(eq(services.isActive, true));
  }
  return db.query.services.findMany({
    where: and(...conditions),
    orderBy: [asc(services.position), asc(services.name)],
  });
}

export async function getService(id: string) {
  const { organizationId } = await requireMembership();
  return db.query.services.findFirst({
    where: and(
      eq(services.id, id),
      eq(services.organizationId, organizationId)
    ),
  });
}

export async function createService(formData: FormData) {
  const { organizationId, organization } = await requireMembership();
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    unitPrice: formData.get("unitPrice") || 0,
    unit: formData.get("unit") || "item",
    currency: formData.get("currency") || organization.currency || "USD",
    isActive: formData.get("isActive") ?? "true",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const id = createId("svc");
  await db.insert(services).values({
    id,
    organizationId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    unitPriceCents: Math.round(parsed.data.unitPrice * 100),
    unit: parsed.data.unit,
    currency: parsed.data.currency,
    isActive: parsed.data.isActive,
  });

  revalidatePath("/services");
  revalidatePath("/quotes");
  return { id };
}

export async function updateService(id: string, formData: FormData) {
  const { organizationId, organization } = await requireMembership();
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || "",
    unitPrice: formData.get("unitPrice") || 0,
    unit: formData.get("unit") || "item",
    currency: formData.get("currency") || organization.currency || "USD",
    isActive: formData.get("isActive") ?? "false",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(services)
    .set({
      name: parsed.data.name,
      description: parsed.data.description || null,
      unitPriceCents: Math.round(parsed.data.unitPrice * 100),
      unit: parsed.data.unit,
      currency: parsed.data.currency,
      isActive: parsed.data.isActive,
      updatedAt: new Date(),
    })
    .where(
      and(eq(services.id, id), eq(services.organizationId, organizationId))
    );

  revalidatePath("/services");
  revalidatePath("/quotes");
  return { ok: true };
}

export async function deleteService(id: string) {
  const { organizationId } = await requireMembership();
  await db
    .delete(services)
    .where(
      and(eq(services.id, id), eq(services.organizationId, organizationId))
    );
  revalidatePath("/services");
  revalidatePath("/quotes");
  return { ok: true };
}

export async function toggleServiceActive(id: string, isActive: boolean) {
  const { organizationId } = await requireMembership();
  await db
    .update(services)
    .set({ isActive, updatedAt: new Date() })
    .where(
      and(eq(services.id, id), eq(services.organizationId, organizationId))
    );
  revalidatePath("/services");
  revalidatePath("/quotes");
  return { ok: true };
}
