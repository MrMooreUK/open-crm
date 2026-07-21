import { notFound } from "next/navigation";
import { getQuote } from "@/lib/actions/quotes";
import { formatCurrency, formatDate } from "@/lib/utils";
import { millisToQuantity } from "@/lib/quotes/math";
import { PrintButton } from "@/components/quotes/print-button";

function orgAddressLines(org: {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
}) {
  const lines: string[] = [];
  if (org.addressLine1) lines.push(org.addressLine1);
  if (org.addressLine2) lines.push(org.addressLine2);
  const cityLine = [org.city, org.region, org.postalCode]
    .filter(Boolean)
    .join(", ");
  if (cityLine) lines.push(cityLine);
  if (org.country) lines.push(org.country);
  return lines;
}

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuote(id);
  if (!quote) notFound();

  const org = quote.organization;
  const fmt = {
    locale: org.locale,
    timezone: org.timezone,
    dateFormat: org.dateFormat,
  };

  const contactName = quote.contact
    ? `${quote.contact.firstName} ${quote.contact.lastName}`.trim()
    : "";

  const addressLines = orgAddressLines(org);
  const displayName = org.legalName || org.name;
  const logoSrc = org.logoUrl?.split("?")[0]
    ? org.logoUrl
    : null;

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>

      <div className="no-print border-b border-zinc-200 bg-zinc-50 px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            Print this page or use your browser&apos;s Save as PDF
          </p>
          <PrintButton />
        </div>
      </div>

      <article className="mx-auto max-w-3xl px-6 py-10">
        <header className="flex items-start justify-between gap-6 border-b border-zinc-200 pb-6">
          <div className="flex min-w-0 items-start gap-4">
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoSrc}
                alt=""
                className="h-14 w-14 shrink-0 object-contain"
              />
            ) : null}
            <div className="min-w-0">
              <div className="text-lg font-semibold tracking-tight">
                {displayName}
              </div>
              <div className="mt-1 space-y-0.5 text-xs text-zinc-500">
                {addressLines.map((line) => (
                  <div key={line}>{line}</div>
                ))}
                {org.email ? <div>{org.email}</div> : null}
                {org.phone ? <div>{org.phone}</div> : null}
                {org.website ? <div>{org.website}</div> : null}
                {org.taxId ? <div>Tax ID: {org.taxId}</div> : null}
              </div>
              <p className="mt-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                Quote
              </p>
            </div>
          </div>
          <div className="shrink-0 text-right text-sm">
            <div className="text-xl font-semibold">{quote.number}</div>
            <div className="mt-1 text-zinc-500">
              {formatDate(quote.createdAt, fmt)}
            </div>
            {quote.validUntil ? (
              <div className="text-zinc-500">
                Valid until {formatDate(quote.validUntil, fmt)}
              </div>
            ) : null}
          </div>
        </header>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Bill to
            </h2>
            <div className="mt-1 text-sm">
              {quote.billToCompany || quote.company?.name ? (
                <div className="font-medium">
                  {quote.billToCompany || quote.company?.name}
                </div>
              ) : null}
              {quote.billToName || contactName ? (
                <div>{quote.billToName || contactName}</div>
              ) : null}
              {quote.billToEmail || quote.contact?.email ? (
                <div className="text-zinc-600">
                  {quote.billToEmail || quote.contact?.email}
                </div>
              ) : null}
              {quote.billToAddress ? (
                <div className="mt-1 whitespace-pre-wrap text-zinc-600">
                  {quote.billToAddress}
                </div>
              ) : null}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Regarding
            </h2>
            <div className="mt-1 text-sm font-medium">{quote.title}</div>
            {quote.enquiry ? (
              <div className="mt-1 text-xs text-zinc-500">
                Enquiry: {quote.enquiry.title}
              </div>
            ) : null}
          </div>
        </div>

        <table className="mt-8 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
              <th className="py-2 pr-2 font-medium">Description</th>
              <th className="px-2 py-2 text-right font-medium">Qty</th>
              <th className="px-2 py-2 text-right font-medium">Unit</th>
              <th className="py-2 pl-2 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((item) => (
              <tr key={item.id} className="border-b border-zinc-100">
                <td className="py-2.5 pr-2">{item.description}</td>
                <td className="px-2 py-2.5 text-right text-zinc-600">
                  {millisToQuantity(item.quantityMillis)}
                </td>
                <td className="px-2 py-2.5 text-right text-zinc-600">
                  {formatCurrency(
                    item.unitPriceCents,
                    quote.currency,
                    org.locale
                  )}
                </td>
                <td className="py-2.5 pl-2 text-right font-medium">
                  {formatCurrency(
                    item.amountCents,
                    quote.currency,
                    org.locale
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-56 space-y-1 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal</span>
              <span>
                {formatCurrency(
                  quote.subtotalCents,
                  quote.currency,
                  org.locale
                )}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Tax ({quote.taxBps / 100}%)</span>
              <span>
                {formatCurrency(quote.taxCents, quote.currency, org.locale)}
              </span>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-semibold">
              <span>Total</span>
              <span>
                {formatCurrency(quote.totalCents, quote.currency, org.locale)}
              </span>
            </div>
          </div>
        </div>

        {quote.notes ? (
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Notes
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
              {quote.notes}
            </p>
          </section>
        ) : null}

        {quote.terms ? (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Terms
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">
              {quote.terms}
            </p>
          </section>
        ) : null}

        <footer className="mt-12 border-t border-zinc-100 pt-4 text-center text-xs text-zinc-500">
          {org.quoteFooter ? (
            <p className="mx-auto max-w-lg whitespace-pre-wrap">
              {org.quoteFooter}
            </p>
          ) : (
            <p>
              {displayName}
              {org.email ? ` · ${org.email}` : ""}
              {org.phone ? ` · ${org.phone}` : ""}
            </p>
          )}
        </footer>
      </article>
    </div>
  );
}
