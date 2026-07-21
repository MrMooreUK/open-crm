import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  const membership = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
    with: { organization: true },
  });

  return NextResponse.json({
    user: session.user,
    organization: membership?.organization ?? null,
    role: membership?.role ?? null,
  });
}
