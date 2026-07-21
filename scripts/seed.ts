import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import {
  companies,
  contacts,
  deals,
  pipelines,
  activities,
} from "../lib/db/schema";
import { createId } from "../lib/id";

/**
 * Seeds demo data for the first organization found.
 * Usage: npm run db:seed
 */
async function main() {
  const membership = await db.query.members.findFirst({
    with: { organization: true, user: true },
  });

  if (!membership) {
    console.error("No organization found. Register an account first.");
    process.exit(1);
  }

  const orgId = membership.organizationId;
  const userId = membership.userId;

  const existing = await db.query.companies.findFirst({
    where: eq(companies.organizationId, orgId),
  });
  if (existing) {
    console.log("Data already exists; skipping seed.");
    process.exit(0);
  }

  const pipeline = await db.query.pipelines.findFirst({
    where: eq(pipelines.organizationId, orgId),
    with: { stages: true },
  });

  if (!pipeline?.stages?.length) {
    console.error("No pipeline/stages found.");
    process.exit(1);
  }

  const stageByName = Object.fromEntries(
    pipeline.stages.map((s) => [s.name, s.id])
  );

  const co1 = createId("co");
  const co2 = createId("co");
  const ct1 = createId("ct");
  const ct2 = createId("ct");
  const deal1 = createId("deal");
  const deal2 = createId("deal");

  await db.insert(companies).values([
    {
      id: co1,
      organizationId: orgId,
      name: "Acme Corp",
      domain: "acme.com",
      industry: "Manufacturing",
      website: "https://acme.com",
      ownerId: userId,
    },
    {
      id: co2,
      organizationId: orgId,
      name: "Globex",
      domain: "globex.io",
      industry: "Software",
      website: "https://globex.io",
      ownerId: userId,
    },
  ]);

  await db.insert(contacts).values([
    {
      id: ct1,
      organizationId: orgId,
      firstName: "Jane",
      lastName: "Buyer",
      email: "jane@acme.com",
      title: "VP Sales",
      companyId: co1,
      ownerId: userId,
    },
    {
      id: ct2,
      organizationId: orgId,
      firstName: "Sam",
      lastName: "Decision",
      email: "sam@globex.io",
      title: "CTO",
      companyId: co2,
      ownerId: userId,
    },
  ]);

  await db.insert(deals).values([
    {
      id: deal1,
      organizationId: orgId,
      title: "Acme annual plan",
      amountCents: 2400000,
      currency: "USD",
      stageId: stageByName["Proposal"] ?? pipeline.stages[0].id,
      companyId: co1,
      contactId: ct1,
      ownerId: userId,
    },
    {
      id: deal2,
      organizationId: orgId,
      title: "Globex pilot",
      amountCents: 850000,
      currency: "USD",
      stageId: stageByName["Qualified"] ?? pipeline.stages[0].id,
      companyId: co2,
      contactId: ct2,
      ownerId: userId,
    },
  ]);

  await db.insert(activities).values([
    {
      id: createId("act"),
      organizationId: orgId,
      type: "note",
      body: "Intro call went well. Interested in annual plan.",
      dealId: deal1,
      companyId: co1,
      contactId: ct1,
      createdById: userId,
    },
    {
      id: createId("act"),
      organizationId: orgId,
      type: "task",
      body: "Send proposal PDF to Jane",
      dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      dealId: deal1,
      companyId: co1,
      createdById: userId,
    },
  ]);

  console.log(`Seeded demo data for org "${membership.organization.name}".`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
