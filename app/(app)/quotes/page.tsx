import Link from "next/link";
import { listQuotes } from "@/lib/actions/quotes";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { QuotesTable } from "@/components/quotes/quotes-table";

export default async function QuotesPage() {
  const [{ organization }, quotes] = await Promise.all([
    requireMembership(),
    listQuotes(),
  ]);

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  return (
    <div>
      <PageHeader
        title="Quotes"
        description={`${quotes.length} total`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/services"
              className="inline-flex h-9 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Services
            </Link>
            <Link
              href="/quotes/new"
              className="btn-primary"
            >
              New quote
            </Link>
          </div>
        }
      />

      {quotes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
          <h3 className="text-sm font-medium text-zinc-900">No quotes yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Create a quote with line items, then print or mark as sent.
          </p>
          <Link
            href="/quotes/new"
            className="mt-4 btn-primary btn-primary-sm"
          >
            New quote
          </Link>
        </div>
      ) : (
        <QuotesTable
          quotes={quotes}
          locale={organization.locale}
          formatOpts={fmt}
        />
      )}
    </div>
  );
}
