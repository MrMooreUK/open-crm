import Link from "next/link";
import { listDeals } from "@/lib/actions/deals";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

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
            className="inline-flex h-9 items-center rounded-md bg-zinc-900 px-3.5 text-sm font-medium text-white hover:bg-zinc-800"
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
            className="mt-4 inline-flex h-8 items-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
          >
            New deal
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-2">Deal</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Stage</th>
                <th className="px-3 py-2">Close</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {deals.map((d) => (
                <tr key={d.id} className="hover:bg-zinc-50/80">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/deals/${d.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {d.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-600">
                    {d.company?.name || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-600">
                    {formatCurrency(
                      d.amountCents,
                      d.currency,
                      organization.locale
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge
                      variant={
                        d.stage.isWon
                          ? "success"
                          : d.stage.isLost
                            ? "danger"
                            : "secondary"
                      }
                    >
                      {d.stage.name}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-500">
                    {formatDate(d.expectedCloseAt, fmt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
