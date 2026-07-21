"use server";

import { and, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies, contacts, deals } from "@/lib/db/schema";
import { requireMembership } from "@/lib/session";

export async function globalSearch(q: string) {
  const { organizationId } = await requireMembership();
  const query = q.trim();
  if (!query) {
    return { companies: [], contacts: [], deals: [] };
  }

  const pattern = `%${query}%`;

  const [companyRows, contactRows, dealRows] = await Promise.all([
    db.query.companies.findMany({
      where: and(
        eq(companies.organizationId, organizationId),
        or(ilike(companies.name, pattern), ilike(companies.domain, pattern))
      ),
      limit: 10,
    }),
    db.query.contacts.findMany({
      where: and(
        eq(contacts.organizationId, organizationId),
        or(
          ilike(contacts.firstName, pattern),
          ilike(contacts.lastName, pattern),
          ilike(contacts.email, pattern),
          sql`(${contacts.firstName} || ' ' || ${contacts.lastName}) ilike ${pattern}`
        )
      ),
      limit: 10,
      with: { company: true },
    }),
    db.query.deals.findMany({
      where: and(
        eq(deals.organizationId, organizationId),
        ilike(deals.title, pattern)
      ),
      limit: 10,
      with: { stage: true, company: true },
    }),
  ]);

  return {
    companies: companyRows,
    contacts: contactRows,
    deals: dealRows,
  };
}
