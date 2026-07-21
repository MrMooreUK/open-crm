"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { requireMembership } from "@/lib/session";

export type NotificationItem = {
  id: string;
  type: "enquiry";
  title: string;
  subtitle: string | null;
  href: string;
  createdAt: Date;
};

export type AppNotifications = {
  /** Total actionable count (badge) */
  count: number;
  /** New enquiries awaiting action */
  newEnquiries: number;
  items: NotificationItem[];
};

/** Badge + dropdown payload for the app shell. */
export async function getAppNotifications(): Promise<AppNotifications> {
  const { organizationId } = await requireMembership();

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(enquiries)
    .where(
      and(
        eq(enquiries.organizationId, organizationId),
        eq(enquiries.status, "new")
      )
    );

  const newEnquiries = countRow?.count ?? 0;

  const recent = await db.query.enquiries.findMany({
    where: and(
      eq(enquiries.organizationId, organizationId),
      eq(enquiries.status, "new")
    ),
    orderBy: [desc(enquiries.createdAt)],
    limit: 8,
    columns: {
      id: true,
      title: true,
      contactName: true,
      contactEmail: true,
      createdAt: true,
    },
    with: {
      company: { columns: { name: true } },
      contact: { columns: { firstName: true, lastName: true } },
    },
  });

  const items: NotificationItem[] = recent.map((e) => {
    const contact =
      e.contact
        ? `${e.contact.firstName} ${e.contact.lastName}`.trim()
        : e.contactName || e.contactEmail || null;
    const parts = [contact, e.company?.name].filter(Boolean);
    return {
      id: e.id,
      type: "enquiry" as const,
      title: e.title,
      subtitle: parts.length ? parts.join(" · ") : null,
      href: `/enquiries/${e.id}`,
      createdAt: e.createdAt,
    };
  });

  return {
    count: newEnquiries,
    newEnquiries,
    items,
  };
}
