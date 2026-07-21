import Link from "next/link";
import { listDeals } from "@/lib/actions/deals";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { DealsTable } from "@/components/deals/deals-table";

export default async function DealsPage() {
  const [{ organization }, deals] = await Promise.all([
    requireMembership(),
    listDeals(),
  ]);

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  return (
    <div>
      <PageHeader
        title="Deals"
        description={`${deals.length} total`}
        actions={
          <Link
            href="/deals/new"
            className="btn-primary"
          >
            New deal
          </Link>
        }
      />

      {deals.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
          <h3 className="text-sm font-medium text-zinc-900">No deals yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Track opportunities through your pipeline.
          </p>
          <Link
            href="/deals/new"
            className="mt-4 btn-primary btn-primary-sm"
          >
            New deal
          </Link>
        </div>
      ) : (
        <DealsTable
          deals={deals}
          locale={organization.locale}
          formatOpts={fmt}
        />
      )}
    </div>
  );
}
