import Link from "next/link";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, fullName } from "@/lib/utils";

export default async function DashboardPage() {
  const [{ organization }, stats] = await Promise.all([
    requireMembership(),
    getDashboardStats(),
  ]);

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  return (
    <div>
      <PageHeader
        title="Home"
        description="Overview of your pipeline and recent activity"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open deals" value={String(stats.openDeals)} />
        <StatCard
          label="Pipeline value"
          value={formatCurrency(
            stats.pipelineValueCents,
            organization.currency,
            organization.locale
          )}
        />
        <StatCard label="Companies" value={String(stats.companies)} />
        <StatCard label="Open tasks" value={String(stats.openTasks)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent deals</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentDeals.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No deals yet.{" "}
                <Link href="/deals" className="underline underline-offset-2">
                  Create one
                </Link>
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {stats.recentDeals.map((deal) => (
                  <li key={deal.id} className="flex items-center gap-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="text-sm font-medium text-zinc-900 hover:underline"
                      >
                        {deal.title}
                      </Link>
                      <div className="text-xs text-zinc-500">
                        {deal.company?.name ?? "No company"} ·{" "}
                        {formatCurrency(
                          deal.amountCents,
                          deal.currency,
                          organization.locale
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">{deal.stage.name}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivities.length === 0 ? (
              <p className="text-sm text-zinc-500">
                Activity will show up as you add notes and tasks.
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {stats.recentActivities.map((a) => (
                  <li key={a.id} className="py-2.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {a.type}
                      </Badge>
                      <span className="text-xs text-zinc-400">
                        {formatDate(a.createdAt, fmt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-700">
                      {a.body}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {a.createdBy?.name}
                      {a.deal
                        ? ` · ${a.deal.title}`
                        : a.contact
                          ? ` · ${fullName(a.contact.firstName, a.contact.lastName)}`
                          : a.company
                            ? ` · ${a.company.name}`
                            : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-0.5 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-400" />
      <CardContent className="pt-4">
        <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </div>
        <div className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900">
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
