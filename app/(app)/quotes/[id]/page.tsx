import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuote } from "@/lib/actions/quotes";
import { listCompanies } from "@/lib/actions/companies";
import { listContacts } from "@/lib/actions/contacts";
import { listDeals } from "@/lib/actions/deals";
import { listEnquiries } from "@/lib/actions/enquiries";
import { listServices } from "@/lib/actions/services";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuoteForm } from "@/components/quotes/quote-form";
import { DeleteQuoteButton } from "@/components/quotes/delete-quote-button";
import { QuoteStatusActions } from "@/components/quotes/quote-status-actions";
import { QuoteExpiryBadge } from "@/components/quotes/quote-expiry-badge";
import { RelatedContext } from "@/components/layout/related-context";
import { formatCurrency, formatDate, fullName } from "@/lib/utils";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const [{ organization }, companies, contacts, enquiries, deals, services] =
    await Promise.all([
      requireMembership(),
      listCompanies(),
      listContacts(),
      listEnquiries(),
      listDeals(),
      listServices({ activeOnly: true }),
    ]);

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  const chips = [
    quote.deal
      ? {
          href: `/deals/${quote.deal.id}`,
          label: quote.deal.title,
          kind: "deal" as const,
        }
      : null,
    quote.enquiry
      ? {
          href: `/enquiries/${quote.enquiry.id}`,
          label: quote.enquiry.title,
          kind: "enquiry" as const,
        }
      : null,
    quote.company
      ? {
          href: `/companies/${quote.company.id}`,
          label: quote.company.name,
          kind: "company" as const,
        }
      : null,
    quote.contact
      ? {
          href: `/contacts/${quote.contact.id}`,
          label: fullName(quote.contact.firstName, quote.contact.lastName),
          kind: "contact" as const,
          sublabel: quote.contact.email ?? undefined,
        }
      : null,
  ].filter(Boolean) as {
    href: string;
    label: string;
    kind: "deal" | "enquiry" | "company" | "contact";
    sublabel?: string;
  }[];

  return (
    <div>
      <PageHeader
        title={quote.number}
        description={`${quote.title} · ${formatCurrency(quote.totalCents, quote.currency, organization.locale)}${
          quote.validUntil
            ? ` · Valid until ${formatDate(quote.validUntil, fmt)}`
            : ""
        }`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="capitalize" variant="secondary">
              {quote.status}
            </Badge>
            <QuoteExpiryBadge
              validUntil={quote.validUntil}
              status={quote.status}
            />
            <Link
              href={`/quotes/${quote.id}/print`}
              target="_blank"
              className="btn-primary btn-primary-sm"
            >
              Print / PDF
            </Link>
            <QuoteStatusActions id={quote.id} status={quote.status} />
            <DeleteQuoteButton id={quote.id} />
          </div>
        }
      />

      <RelatedContext items={chips} />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quote.contact ? (
          <Link
            href={`/contacts/${quote.contact.id}`}
            className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-colors hover:border-zinc-300"
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Contact
            </div>
            <div className="mt-0.5 text-sm font-medium text-zinc-900">
              {fullName(quote.contact.firstName, quote.contact.lastName)}
            </div>
            <div className="text-xs text-zinc-500">
              {[quote.contact.email, quote.contact.phone, quote.contact.title]
                .filter(Boolean)
                .join(" · ") || "View contact"}
            </div>
          </Link>
        ) : null}
        {quote.company ? (
          <Link
            href={`/companies/${quote.company.id}`}
            className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-colors hover:border-zinc-300"
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Company
            </div>
            <div className="mt-0.5 text-sm font-medium text-zinc-900">
              {quote.company.name}
            </div>
            <div className="text-xs text-zinc-500">
              {quote.company.domain || quote.company.industry || "View company"}
            </div>
          </Link>
        ) : null}
        {quote.deal ? (
          <Link
            href={`/deals/${quote.deal.id}`}
            className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-colors hover:border-zinc-300"
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Deal
            </div>
            <div className="mt-0.5 text-sm font-medium text-zinc-900">
              {quote.deal.title}
            </div>
            <div className="text-xs text-zinc-500">Open opportunity</div>
          </Link>
        ) : null}
        {quote.enquiry ? (
          <Link
            href={`/enquiries/${quote.enquiry.id}`}
            className="rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-colors hover:border-zinc-300"
          >
            <div className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
              Enquiry
            </div>
            <div className="mt-0.5 text-sm font-medium text-zinc-900">
              {quote.enquiry.title}
            </div>
            <div className="text-xs text-zinc-500 capitalize">
              {quote.enquiry.status.replace("_", " ")}
            </div>
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit quote</CardTitle>
        </CardHeader>
        <CardContent>
          <QuoteForm
            quote={quote}
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
            enquiries={enquiries.map((e) => ({ id: e.id, title: e.title }))}
            deals={deals.map((d) => ({ id: d.id, title: d.title }))}
            services={services.map((s) => ({
              id: s.id,
              name: s.name,
              description: s.description,
              unitPriceCents: s.unitPriceCents,
              unit: s.unit,
              currency: s.currency,
            }))}
            defaultCurrency={organization.currency}
          />
        </CardContent>
      </Card>
    </div>
  );
}
