"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { invites, members, organizations, user } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { getSession, requireMembership } from "@/lib/session";
import {
  inviteSchema,
  orgProfileSchema,
  orgRegionalSchema,
} from "@/lib/validations";

const MAX_LOGO_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_LOGO_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

function emptyToNull(v: string | undefined | null) {
  const t = (v ?? "").trim();
  return t ? t : null;
}

function revalidateOrgSettings() {
  revalidatePath("/settings");
  revalidatePath("/settings/branding");
  revalidatePath("/settings/regional");
  revalidatePath("/settings/team");
  revalidatePath("/");
  revalidatePath("/deals");
  revalidatePath("/pipeline");
  revalidatePath("/tasks");
  revalidatePath("/companies");
  revalidatePath("/quotes");
}

export async function updateOrganizationProfile(formData: FormData) {
  const { organizationId, role } = await requireMembership();
  if (role !== "owner") {
    return { error: "Only owners can update organization settings" };
  }

  const parsed = orgProfileSchema.safeParse({
    name: formData.get("name"),
    legalName: formData.get("legalName") || "",
    email: formData.get("email") || "",
    phone: formData.get("phone") || "",
    website: formData.get("website") || "",
    addressLine1: formData.get("addressLine1") || "",
    addressLine2: formData.get("addressLine2") || "",
    city: formData.get("city") || "",
    region: formData.get("region") || "",
    postalCode: formData.get("postalCode") || "",
    country: formData.get("country") || "",
    taxId: formData.get("taxId") || "",
    quoteFooter: formData.get("quoteFooter") || "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(organizations)
    .set({
      name: parsed.data.name,
      legalName: emptyToNull(parsed.data.legalName),
      email: emptyToNull(parsed.data.email),
      phone: emptyToNull(parsed.data.phone),
      website: emptyToNull(parsed.data.website),
      addressLine1: emptyToNull(parsed.data.addressLine1),
      addressLine2: emptyToNull(parsed.data.addressLine2),
      city: emptyToNull(parsed.data.city),
      region: emptyToNull(parsed.data.region),
      postalCode: emptyToNull(parsed.data.postalCode),
      country: emptyToNull(parsed.data.country),
      taxId: emptyToNull(parsed.data.taxId),
      quoteFooter: emptyToNull(parsed.data.quoteFooter),
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId));

  revalidateOrgSettings();
  return { ok: true };
}

export async function updateOrganizationRegional(formData: FormData) {
  const { organizationId, role } = await requireMembership();
  if (role !== "owner") {
    return { error: "Only owners can update organization settings" };
  }

  const parsed = orgRegionalSchema.safeParse({
    timezone: formData.get("timezone") || "UTC",
    currency: formData.get("currency") || "USD",
    locale: formData.get("locale") || "en-US",
    dateFormat: formData.get("dateFormat") || "medium",
    weekStartsOn: formData.get("weekStartsOn") ?? 1,
    fiscalYearStartMonth: formData.get("fiscalYearStartMonth") ?? 1,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(organizations)
    .set({
      timezone: parsed.data.timezone,
      currency: parsed.data.currency,
      locale: parsed.data.locale,
      dateFormat: parsed.data.dateFormat,
      weekStartsOn: parsed.data.weekStartsOn,
      fiscalYearStartMonth: parsed.data.fiscalYearStartMonth,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, organizationId));

  revalidateOrgSettings();
  return { ok: true };
}

export async function uploadOrganizationLogo(formData: FormData) {
  const { organizationId, role, organization } = await requireMembership();
  if (role !== "owner") {
    return { error: "Only owners can update the logo" };
  }

  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file" };
  }
  if (file.size > MAX_LOGO_BYTES) {
    return { error: "Logo must be under 2 MB" };
  }

  const ext = ALLOWED_LOGO_TYPES[file.type];
  if (!ext) {
    return { error: "Use PNG, JPEG, WebP, or SVG" };
  }

  const dir = path.join(process.cwd(), "public", "uploads", "logos");
  await mkdir(dir, { recursive: true });

  // Remove previous logo if different extension
  if (organization.logoUrl?.startsWith("/uploads/logos/")) {
    const prev = path.join(process.cwd(), "public", organization.logoUrl);
    try {
      await unlink(prev);
    } catch {
      // ignore missing file
    }
  }

  const filename = `${organizationId}.${ext}`;
  const fullPath = path.join(dir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);

  // cache-bust query so browsers pick up replacements
  const logoUrl = `/uploads/logos/${filename}?v=${Date.now()}`;

  await db
    .update(organizations)
    .set({ logoUrl, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId));

  revalidateOrgSettings();
  revalidatePath("/quotes");
  return { logoUrl };
}

export async function removeOrganizationLogo() {
  const { organizationId, role, organization } = await requireMembership();
  if (role !== "owner") {
    return { error: "Only owners can update the logo" };
  }

  if (organization.logoUrl?.startsWith("/uploads/logos/")) {
    const filePath = organization.logoUrl.split("?")[0];
    const prev = path.join(process.cwd(), "public", filePath);
    try {
      await unlink(prev);
    } catch {
      // ignore
    }
  }

  await db
    .update(organizations)
    .set({ logoUrl: null, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId));

  revalidateOrgSettings();
  revalidatePath("/quotes");
  return { ok: true };
}

export async function listMembers() {
  const { organizationId } = await requireMembership();
  return db
    .select({
      id: members.id,
      role: members.role,
      createdAt: members.createdAt,
      userId: user.id,
      name: user.name,
      email: user.email,
    })
    .from(members)
    .innerJoin(user, eq(members.userId, user.id))
    .where(eq(members.organizationId, organizationId));
}

export async function listInvites() {
  const { organizationId, role } = await requireMembership();
  if (role !== "owner") return [];
  return db.query.invites.findMany({
    where: eq(invites.organizationId, organizationId),
  });
}

export async function createInvite(formData: FormData) {
  const { organizationId, role, user: currentUser } = await requireMembership();
  if (role !== "owner") {
    return { error: "Only owners can invite members" };
  }

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") || "member",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const token = createId("inv");
  const id = createId("invite");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.insert(invites).values({
    id,
    organizationId,
    email: parsed.data.email.toLowerCase(),
    role: parsed.data.role,
    token,
    expiresAt,
    createdById: currentUser.id,
  });

  revalidatePath("/settings");
  return { token, inviteUrl: `/invite/${token}` };
}

export async function redeemInvite(token: string) {
  const session = await getSession();
  if (!session) return { error: "Not authenticated" };

  const invite = await db.query.invites.findFirst({
    where: eq(invites.token, token),
  });
  if (!invite) return { error: "Invite not found" };
  if (invite.expiresAt < new Date()) return { error: "Invite expired" };

  if (session.user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      error: `This invite is for ${invite.email}. Sign in with that email.`,
    };
  }

  const existing = await db.query.members.findFirst({
    where: and(
      eq(members.organizationId, invite.organizationId),
      eq(members.userId, session.user.id)
    ),
  });

  if (!existing) {
    await db.insert(members).values({
      id: createId("mem"),
      organizationId: invite.organizationId,
      userId: session.user.id,
      role: invite.role,
    });
  }

  await db.delete(invites).where(eq(invites.id, invite.id));
  revalidatePath("/");
  return { ok: true };
}
