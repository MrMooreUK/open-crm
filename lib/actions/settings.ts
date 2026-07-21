"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { invites, members, organizations, user } from "@/lib/db/schema";
import { createId } from "@/lib/id";
import { getSession, requireMembership } from "@/lib/session";
import { inviteSchema, orgSettingsSchema } from "@/lib/validations";

export async function updateOrganization(formData: FormData) {
  const { organizationId, role } = await requireMembership();
  if (role !== "owner") {
    return { error: "Only owners can update organization settings" };
  }

  const parsed = orgSettingsSchema.safeParse({
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await db
    .update(organizations)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(organizations.id, organizationId));

  revalidatePath("/settings");
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
