import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, listCompanies } from "@/lib/actions/companies";
import { listActivitiesFor } from "@/lib/actions/activities";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyForm } from "@/components/companies/company-form";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import {
  RelatedList,
  RelatedListItem,
} from "@/components/layout/related-context";
import { formatCurrency, fullName } from "@/lib/utils";
import { DeleteCompanyButton } from "@/components/companies/delete-company-button";
import { CompanyQuickAddContact } from "@/components/contacts/company-quick-add-contact";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const [{ organization }, activityList, allCompanies] = await Promise.all([
    requireMembership(),
    listActivitiesFor({ companyId: id }),
    listCompanies(),
  ]);

  return (
    <div>
      <PageHeader
        title={company.name}
        description={
          [company.domain, company.industry, company.website]
            .filter(Boolean)
            .join(" · ") || "Company"
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/deals/new?companyId=${company.id}`}
              className="inline-flex h-8 items-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              New deal
            </Link>
            <Link
              href={`/quotes/new?companyId=${company.id}`}
              className="inline-flex h-8 items-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
            >
              New quote
            </Link>
            <DeleteCompanyButton id={company.id} />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <CompanyForm company={company} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Contacts</CardTitle>
              <CompanyQuickAddContact
                companyId={company.id}
                companyName={company.name}
                companies={allCompanies.map((c) => ({
                  id: c.id,
                  name: c.name,
                  domain: c.domain,
                }))}
              />
            </CardHeader>
            <CardContent>
              {company.contacts.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No contacts yet — use Add contact above.
                </p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {company.contacts.map((c) => (
                    <li
                      key={c.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div>
                        <Link
                          href={`/contacts/${c.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {fullName(c.firstName, c.lastName)}
                        </Link>
                        <div className="text-xs text-zinc-500">
                          {[c.email, c.phone, c.title]
                            .filter(Boolean)
                            .join(" · ") || "—"}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <RelatedList
            title="Deals"
            hrefNew={`/deals/new?companyId=${company.id}`}
            newLabel="Add deal"
            empty="No deals yet."
          >
            {company.deals.map((d) => (
              <RelatedListItem
                key={d.id}
                href={`/deals/${d.id}`}
                title={d.title}
                meta={formatCurrency(
                  d.amountCents,
                  d.currency,
                  organization.locale
                )}
                badge={<Badge variant="secondary">{d.stage.name}</Badge>}
              />
            ))}
          </RelatedList>

          <RelatedList
            title="Quotes"
            hrefNew={`/quotes/new?companyId=${company.id}`}
            newLabel="Add quote"
            empty="No quotes yet."
          >
            {company.quotes.map((q) => (
              <RelatedListItem
                key={q.id}
                href={`/quotes/${q.id}`}
                title={q.number}
                meta={`${q.title} · ${formatCurrency(
                  q.totalCents,
                  q.currency,
                  organization.locale
                )}`}
                badge={
                  <Badge variant="secondary" className="capitalize">
                    {q.status}
                  </Badge>
                }
              />
            ))}
          </RelatedList>

          <RelatedList
            title="Enquiries"
            hrefNew="/enquiries/new"
            newLabel="Add enquiry"
            empty="No enquiries yet."
          >
            {company.enquiries.map((e) => (
              <RelatedListItem
                key={e.id}
                href={`/enquiries/${e.id}`}
                title={e.title}
                meta={e.status.replace("_", " ")}
                badge={
                  <Badge variant="secondary" className="capitalize">
                    {e.status.replace("_", " ")}
                  </Badge>
                }
              />
            ))}
          </RelatedList>
        </div>

        <div>
          <ActivityTimeline
            activities={activityList}
            companyId={company.id}
          />
        </div>
      </div>
    </div>
  );
}
