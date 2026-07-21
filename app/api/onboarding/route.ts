import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { createOrganizationForUser } from "@/lib/org";

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const organizationName =
    typeof body.organizationName === "string" && body.organizationName.trim()
      ? body.organizationName.trim()
      : `${session.user.name}'s workspace`;

  const existing = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
  });

  if (existing) {
    return NextResponse.json({ organizationId: existing.organizationId });
  }

  const result = await createOrganizationForUser({
    userId: session.user.id,
    organizationName,
  });

  return NextResponse.json(result);
}
