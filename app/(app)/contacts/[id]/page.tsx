import Link from "next/link";
import { notFound } from "next/navigation";
import { getContact } from "@/lib/actions/contacts";
import { listCompanies } from "@/lib/actions/companies";
import { listActivitiesFor } from "@/lib/actions/activities";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContactForm } from "@/components/contacts/contact-form";
import { DeleteContactButton } from "@/components/contacts/delete-contact-button";
import { ActivityTimeline } from "@/components/activities/activity-timeline";
import {
  RelatedContext,
  RelatedList,
  RelatedListItem,
} from "@/components/layout/related-context";
import { formatCurrency, fullName } from "@/lib/utils";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await getContact(id);
  if (!contact) notFound();

  const [{ organization }, companies, activityList] = await Promise.all([
    requireMembership(),
    listCompanies(),
    listActivitiesFor({ contactId: id }),
  ]);

  const chips = [
    contact.company
      ? {
          href: `/companies/${contact.company.id}`,
          label: contact.company.name,
          kind: "company" as const,
          sublabel: contact.company.domain ?? undefined,
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    kind: "company";
    sublabel?: string;
  }[];

  return (
    <div>
      <PageHeader
        title={fullName(contact.firstName, contact.lastName)}
        description={
          [contact.title, contact.email, contact.phone]
            .filter(Boolean)
            .join(" · ") || "Contact"
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/deals/new?contactId=${contact.id}${
                contact.companyId ? `&companyId=${contact.companyId}` : ""
              }`}
              className="inline-flex h-8 items-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              New deal
            </Link>
            <Link
              href={`/quotes/new?contactId=${contact.id}${
                contact.companyId ? `&companyId=${contact.companyId}` : ""
              }`}
              className="btn-primary btn-primary-sm"
            >
              New quote
            </Link>
            <DeleteContactButton id={contact.id} />
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
              <ContactForm
                contact={contact}
                companies={companies.map((c) => ({ id: c.id, name: c.name }))}
              />
            </CardContent>
          </Card>

          <RelatedList
            title="Deals"
            hrefNew={`/deals/new?contactId=${contact.id}${
              contact.companyId ? `&companyId=${contact.companyId}` : ""
            }`}
            newLabel="Add deal"
            empty="No deals linked."
          >
            {contact.deals.map((d) => (
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
            hrefNew={`/quotes/new?contactId=${contact.id}${
              contact.companyId ? `&companyId=${contact.companyId}` : ""
            }`}
            newLabel="Add quote"
            empty="No quotes linked."
          >
            {contact.quotes.map((q) => (
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
            hrefNew={`/enquiries/new`}
            newLabel="Add enquiry"
            empty="No enquiries linked."
          >
            {contact.enquiries.map((e) => (
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
            contactId={contact.id}
            companyId={contact.companyId ?? undefined}
          />
        </div>
      </div>
    </div>
  );
}
