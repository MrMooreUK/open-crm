"use server";

import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  activities,
  companies,
  contacts,
  deals,
  stages,
} from "@/lib/db/schema";
import { requireMembership } from "@/lib/session";

export async function getDashboardStats() {
  const { organizationId } = await requireMembership();

  const [companyCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(companies)
    .where(eq(companies.organizationId, organizationId));

  const [contactCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(contacts)
    .where(eq(contacts.organizationId, organizationId));

  const openDeals = await db
    .select({
      count: sql<number>`count(*)::int`,
      total: sql<number>`coalesce(sum(${deals.amountCents}), 0)::int`,
    })
    .from(deals)
    .innerJoin(stages, eq(deals.stageId, stages.id))
    .where(
      and(
        eq(deals.organizationId, organizationId),
        eq(stages.isWon, false),
        eq(stages.isLost, false)
      )
    );

  const [taskCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(activities)
    .where(
      and(
        eq(activities.organizationId, organizationId),
        eq(activities.type, "task"),
        isNull(activities.completedAt)
      )
    );

  const recentActivities = await db.query.activities.findMany({
    where: eq(activities.organizationId, organizationId),
    orderBy: [desc(activities.createdAt)],
    limit: 8,
    with: {
      createdBy: true,
      company: true,
      contact: true,
      deal: true,
    },
  });

  const recentDeals = await db.query.deals.findMany({
    where: eq(deals.organizationId, organizationId),
    orderBy: [desc(deals.updatedAt)],
    limit: 5,
    with: { stage: true, company: true },
  });

  return {
    companies: companyCount?.count ?? 0,
    contacts: contactCount?.count ?? 0,
    openDeals: openDeals[0]?.count ?? 0,
    pipelineValueCents: openDeals[0]?.total ?? 0,
    openTasks: taskCount?.count ?? 0,
    recentActivities,
    recentDeals,
  };
}
