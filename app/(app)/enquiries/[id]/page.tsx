import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnquiry } from "@/lib/actions/enquiries";
import { listCompanies } from "@/lib/actions/companies";
import { listContacts } from "@/lib/actions/contacts";
import { listTeamMembers } from "@/lib/team";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EnquiryForm } from "@/components/enquiries/enquiry-form";
import { DeleteEnquiryButton } from "@/components/enquiries/delete-enquiry-button";
import {
  RelatedContext,
  RelatedList,
  RelatedListItem,
} from "@/components/layout/related-context";
import { formatCurrency, formatDate, fullName } from "@/lib/utils";
import { requireMembership } from "@/lib/session";

export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const enquiry = await getEnquiry(id);
  if (!enquiry) notFound();

  const [{ organization, user }, companies, contacts, members] =
    await Promise.all([
      requireMembership(),
      listCompanies(),
      listContacts(),
      listTeamMembers(),
    ]);

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  const chips = [
    enquiry.company
      ? {
          href: `/companies/${enquiry.company.id}`,
          label: enquiry.company.name,
          kind: "company" as const,
        }
      : null,
    enquiry.contact
      ? {
          href: `/contacts/${enquiry.contact.id}`,
          label: fullName(
            enquiry.contact.firstName,
            enquiry.contact.lastName
          ),
          kind: "contact" as const,
          sublabel: enquiry.contact.email ?? undefined,
        }
      : null,
    enquiry.deal
      ? {
          href: `/deals/${enquiry.deal.id}`,
          label: enquiry.deal.title,
          kind: "deal" as const,
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    kind: "company" | "contact" | "deal";
    sublabel?: string;
  }[];

  return (
    <div>
      <PageHeader
        title={enquiry.title}
        description={[
          enquiry.source,
          enquiry.owner ? `Assigned: ${enquiry.owner.name}` : "Unassigned",
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="capitalize" variant="secondary">
              {enquiry.status.replace("_", " ")}
            </Badge>
            <Link
              href={`/quotes/new?enquiryId=${enquiry.id}${
                enquiry.companyId ? `&companyId=${enquiry.companyId}` : ""
              }${enquiry.contactId ? `&contactId=${enquiry.contactId}` : ""}`}
              className="inline-flex h-8 items-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
            >
              Generate quote
            </Link>
            <Link
              href={`/deals/new?companyId=${enquiry.companyId ?? ""}${
                enquiry.contactId ? `&contactId=${enquiry.contactId}` : ""
              }`}
              className="inline-flex h-8 items-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Create deal
            </Link>
            <DeleteEnquiryButton id={enquiry.id} />
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
              <EnquiryForm
                enquiry={enquiry}
                companies={companies.map((c) => ({ id: c.id, name: c.name }))}
                contacts={contacts.map((c) => ({
                  id: c.id,
                  firstName: c.firstName,
                  lastName: c.lastName,
                  email: c.email,
                  phone: c.phone,
                  companyId: c.companyId,
                }))}
                members={members.map((m) => ({
                  userId: m.userId,
                  name: m.name,
                  email: m.email,
                }))}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {(enquiry.contact ||
            enquiry.contactName ||
            enquiry.contactEmail ||
            enquiry.company) && (
            <Card>
              <CardHeader>
                <CardTitle>Who</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {enquiry.contact ? (
                  <div>
                    <Link
                      href={`/contacts/${enquiry.contact.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {fullName(
                        enquiry.contact.firstName,
                        enquiry.contact.lastName
                      )}
                    </Link>
                    {enquiry.contact.email ? (
                      <div className="text-xs text-zinc-500">
                        {enquiry.contact.email}
                      </div>
                    ) : null}
                    {enquiry.contact.phone ? (
                      <div className="text-xs text-zinc-500">
                        {enquiry.contact.phone}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div>
                    <div className="font-medium text-zinc-900">
                      {enquiry.contactName || "Unknown contact"}
                    </div>
                    {enquiry.contactEmail ? (
                      <div className="text-xs text-zinc-500">
                        {enquiry.contactEmail}
                      </div>
                    ) : null}
                    {enquiry.contactPhone ? (
                      <div className="text-xs text-zinc-500">
                        {enquiry.contactPhone}
                      </div>
                    ) : null}
                  </div>
                )}
                {enquiry.company ? (
                  <div className="pt-1">
                    <Link
                      href={`/companies/${enquiry.company.id}`}
                      className="text-sm font-medium text-zinc-800 hover:underline"
                    >
                      {enquiry.company.name}
                    </Link>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          <RelatedList
            title="Quotes"
            hrefNew={`/quotes/new?enquiryId=${enquiry.id}${
              enquiry.companyId ? `&companyId=${enquiry.companyId}` : ""
            }${enquiry.contactId ? `&contactId=${enquiry.contactId}` : ""}`}
            newLabel="New"
            empty="No quotes yet — generate one from this enquiry."
          >
            {enquiry.quotes.map((q) => (
              <RelatedListItem
                key={q.id}
                href={`/quotes/${q.id}`}
                title={q.number}
                meta={`${formatCurrency(
                  q.totalCents,
                  q.currency,
                  organization.locale
                )} · ${formatDate(q.createdAt, fmt)}`}
                badge={
                  <Badge variant="secondary" className="capitalize">
                    {q.status}
                  </Badge>
                }
              />
            ))}
          </RelatedList>
        </div>
      </div>
    </div>
  );
}
