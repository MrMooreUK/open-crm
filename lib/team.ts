"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { members, user } from "@/lib/db/schema";
import { requireMembership } from "@/lib/session";

export type TeamMember = {
  userId: string;
  name: string;
  email: string;
  role: "owner" | "member";
};

/** List org members for assignee pickers */
export async function listTeamMembers(): Promise<TeamMember[]> {
  const { organizationId } = await requireMembership();
  const rows = await db
    .select({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: members.role,
    })
    .from(members)
    .innerJoin(user, eq(members.userId, user.id))
    .where(eq(members.organizationId, organizationId));

  return rows.map((r) => ({
    userId: r.userId,
    name: r.name,
    email: r.email,
    role: r.role,
  }));
}

/** Ensure a user id is a member of the current org (or empty/null) */
export async function resolveAssigneeId(
  organizationId: string,
  ownerId: string | null | undefined,
  fallbackUserId: string
): Promise<string | null> {
  if (!ownerId) return fallbackUserId;

  const membership = await db.query.members.findFirst({
    where: and(
      eq(members.organizationId, organizationId),
      eq(members.userId, ownerId)
    ),
  });

  return membership ? ownerId : fallbackUserId;
}
