import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies, contacts, deals, pipelines, stages } from "@/lib/db/schema";

export async function companyBelongsToOrganization(
  companyId: string,
  organizationId: string
) {
  return db.query.companies.findFirst({
    where: and(eq(companies.id, companyId), eq(companies.organizationId, organizationId)),
  });
}

export async function contactBelongsToOrganization(
  contactId: string,
  organizationId: string
) {
  return db.query.contacts.findFirst({
    where: and(eq(contacts.id, contactId), eq(contacts.organizationId, organizationId)),
  });
}

export async function dealBelongsToOrganization(
  dealId: string,
  organizationId: string
) {
  return db.query.deals.findFirst({
    where: and(eq(deals.id, dealId), eq(deals.organizationId, organizationId)),
  });
}

export async function stageBelongsToOrganization(
  stageId: string,
  organizationId: string
) {
  const [row] = await db
    .select({ id: stages.id })
    .from(stages)
    .innerJoin(pipelines, eq(stages.pipelineId, pipelines.id))
    .where(and(eq(stages.id, stageId), eq(pipelines.organizationId, organizationId)))
    .limit(1);

  return row ?? null;
}

export async function validateOptionalCrmLinks(params: {
  organizationId: string;
  companyId?: string | null;
  contactId?: string | null;
  dealId?: string | null;
}) {
  const { organizationId } = params;

  const [company, contact, deal] = await Promise.all([
    params.companyId
      ? companyBelongsToOrganization(params.companyId, organizationId)
      : Promise.resolve(null),
    params.contactId
      ? contactBelongsToOrganization(params.contactId, organizationId)
      : Promise.resolve(null),
    params.dealId
      ? dealBelongsToOrganization(params.dealId, organizationId)
      : Promise.resolve(null),
  ]);

  if (params.companyId && !company) return { error: "Company not found" };
  if (params.contactId && !contact) return { error: "Contact not found" };
  if (params.dealId && !deal) return { error: "Deal not found" };

  return { ok: true as const };
}
