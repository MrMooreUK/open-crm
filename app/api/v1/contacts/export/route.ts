import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contacts, members } from "@/lib/db/schema";
import {
  type ContactIOFormat,
  type ContactIORow,
  serializeContacts,
} from "@/lib/contacts/io";

const FORMATS: ContactIOFormat[] = ["csv", "tsv", "json", "vcf", "xlsx"];

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  const membership = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
  });

  if (!membership) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "No organization" } },
      { status: 403 }
    );
  }

  const formatParam = (
    req.nextUrl.searchParams.get("format") || "csv"
  ).toLowerCase() as ContactIOFormat;

  if (!FORMATS.includes(formatParam)) {
    return NextResponse.json(
      {
        error: {
          code: "BAD_REQUEST",
          message: `format must be one of: ${FORMATS.join(", ")}`,
        },
      },
      { status: 400 }
    );
  }

  const rows = await db.query.contacts.findMany({
    where: eq(contacts.organizationId, membership.organizationId),
    with: { company: true },
    orderBy: (c, { asc }) => [asc(c.lastName), asc(c.firstName)],
  });

  const ioRows: ContactIORow[] = rows.map((c) => ({
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email ?? "",
    phone: c.phone ?? "",
    title: c.title ?? "",
    company: c.company?.name ?? "",
    notes: c.notes ?? "",
  }));

  const { body, mime, extension } = await serializeContacts(
    ioRows,
    formatParam
  );

  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `open-crm-contacts-${stamp}.${extension}`;

  if (typeof body === "string") {
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(Buffer.from(body), {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
