import Link from "next/link";
import { notFound } from "next/navigation";
import { getCompany, listCompanies } from "@/lib/actions/companies";
import { listActivitiesFor } from "@/lib/actions/activities";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyForm } from "@/components/companies/company-form";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
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

  const [activityList, allCompanies] = await Promise.all([
    listActivitiesFor({ companyId: id }),
    listCompanies(),
  ]);

  return (
    <div>
      <PageHeader
        title={company.name}
        description={[company.domain, company.industry].filter(Boolean).join(" · ") || "Company"}
        actions={<DeleteCompanyButton id={company.id} />}
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
                    <li key={c.id} className="flex items-center justify-between py-2">
                      <Link
                        href={`/contacts/${c.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {fullName(c.firstName, c.lastName)}
                      </Link>
                      <span className="text-xs text-zinc-500">{c.email || c.title || "—"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Deals</CardTitle>
              <Link
                href={`/deals/new?companyId=${company.id}`}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
              >
                Add deal
              </Link>
            </CardHeader>
            <CardContent>
              {company.deals.length === 0 ? (
                <p className="text-sm text-zinc-500">No deals yet.</p>
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {company.deals.map((d) => (
                    <li key={d.id} className="flex items-center justify-between py-2">
                      <Link
                        href={`/deals/${d.id}`}
                        className="text-sm font-medium hover:underline"
                      >
                        {d.title}
                      </Link>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500">
                          {formatCurrency(d.amountCents, d.currency)}
                        </span>
                        <Badge variant="secondary">{d.stage.name}</Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
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
