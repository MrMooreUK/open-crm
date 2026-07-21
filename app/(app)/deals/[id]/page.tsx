import Link from "next/link";
import { notFound } from "next/navigation";
import { getDeal, getDefaultPipeline } from "@/lib/actions/deals";
import { listCompanies } from "@/lib/actions/companies";
import { listContacts } from "@/lib/actions/contacts";
import { listActivitiesFor } from "@/lib/actions/activities";
import { listTeamMembers } from "@/lib/team";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DealForm } from "@/components/deals/deal-form";
import { DeleteDealButton } from "@/components/deals/delete-deal-button";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import {
  RelatedContext,
  RelatedList,
  RelatedListItem,
} from "@/components/layout/related-context";
import { formatCurrency, fullName } from "@/lib/utils";

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await getDeal(id);
  if (!deal) notFound();

  const [
    { organization, user },
    companies,
    contacts,
    pipeline,
    activityList,
    members,
  ] = await Promise.all([
    requireMembership(),
    listCompanies(),
    listContacts(),
    getDefaultPipeline(),
    listActivitiesFor({ dealId: id }),
    listTeamMembers(),
  ]);

  const stages = pipeline?.stages ?? [];

  const chips = [
    deal.company
      ? {
          href: `/companies/${deal.company.id}`,
          label: deal.company.name,
          kind: "company" as const,
        }
      : null,
    deal.contact
      ? {
          href: `/contacts/${deal.contact.id}`,
          label: fullName(deal.contact.firstName, deal.contact.lastName),
          kind: "contact" as const,
          sublabel: deal.contact.email ?? undefined,
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    kind: "company" | "contact";
    sublabel?: string;
  }[];

  return (
    <div>
      <PageHeader
        title={deal.title}
        description={`${formatCurrency(deal.amountCents, deal.currency, organization.locale)} · ${deal.stage.name}${deal.owner ? ` · ${deal.owner.name}` : ""}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                deal.stage.isWon
                  ? "success"
                  : deal.stage.isLost
                    ? "danger"
                    : "secondary"
              }
            >
              {deal.stage.name}
            </Badge>
            <Link
              href={`/quotes/new?dealId=${deal.id}${
                deal.companyId ? `&companyId=${deal.companyId}` : ""
              }${deal.contactId ? `&contactId=${deal.contactId}` : ""}`}
              className="inline-flex h-8 items-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
            >
              New quote
            </Link>
            <DeleteDealButton id={deal.id} />
          </div>
        }
      />

      <RelatedContext items={chips} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent>
              <DealForm
                deal={deal}
                stages={stages.map((s) => ({ id: s.id, name: s.name }))}
                companies={companies.map((c) => ({ id: c.id, name: c.name }))}
                contacts={contacts.map((c) => ({
                  id: c.id,
                  firstName: c.firstName,
                  lastName: c.lastName,
                  email: c.email,
                  phone: c.phone,
                  title: c.title,
                  companyId: c.companyId,
                }))}
                members={members.map((m) => ({
                  userId: m.userId,
                  name: m.name,
                  email: m.email,
                }))}
                currentUserId={user.id}
                defaultCurrency={organization.currency}
              />
            </CardContent>
          </Card>

          <RelatedList
            title="Quotes"
            hrefNew={`/quotes/new?dealId=${deal.id}${
              deal.companyId ? `&companyId=${deal.companyId}` : ""
            }${deal.contactId ? `&contactId=${deal.contactId}` : ""}`}
            newLabel="Add quote"
            empty="No quotes on this deal yet."
          >
            {deal.quotes.map((q) => (
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

          {deal.enquiries.length > 0 ? (
            <RelatedList title="Enquiries" empty="None">
              {deal.enquiries.map((e) => (
                <RelatedListItem
                  key={e.id}
                  href={`/enquiries/${e.id}`}
                  title={e.title}
                  meta={e.status.replace("_", " ")}
                />
              ))}
            </RelatedList>
          ) : null}
        </div>
        <div className="space-y-4">
          {(deal.contact || deal.company) && (
            <Card>
              <CardHeader>
                <CardTitle>People & accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {deal.contact ? (
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Contact
                    </div>
                    <Link
                      href={`/contacts/${deal.contact.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {fullName(
                        deal.contact.firstName,
                        deal.contact.lastName
                      )}
                    </Link>
                    {deal.contact.email ? (
                      <div className="text-xs text-zinc-500">
                        {deal.contact.email}
                      </div>
                    ) : null}
                    {deal.contact.phone ? (
                      <div className="text-xs text-zinc-500">
                        {deal.contact.phone}
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {deal.company ? (
                  <div>
                    <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                      Company
                    </div>
                    <Link
                      href={`/companies/${deal.company.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {deal.company.name}
                    </Link>
                    {deal.company.domain ? (
                      <div className="text-xs text-zinc-500">
                        {deal.company.domain}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}
          <ActivityTimeline
            activities={activityList}
            dealId={deal.id}
            companyId={deal.companyId ?? undefined}
            contactId={deal.contactId ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
