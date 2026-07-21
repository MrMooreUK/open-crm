import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { members, organizations } from "@/lib/db/schema";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireMembership() {
  const session = await requireSession();

  const membership = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
    with: {
      organization: true,
    },
  });

  if (!membership) {
    redirect("/onboarding");
  }

  return {
    session,
    user: session.user,
    member: membership,
    organization: membership.organization,
    organizationId: membership.organizationId,
    role: membership.role,
  };
}

export async function getMembershipOptional() {
  const session = await getSession();
  if (!session) return null;

  const membership = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
    with: {
      organization: true,
    },
  });

  if (!membership) return { session, membership: null };

  return {
    session,
    membership,
    organization: membership.organization as typeof organizations.$inferSelect,
  };
}
