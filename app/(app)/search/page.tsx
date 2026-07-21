import Link from "next/link";
import { globalSearch } from "@/lib/actions/search";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, fullName } from "@/lib/utils";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q.trim()
    ? await globalSearch(q)
    : { companies: [], contacts: [], deals: [] };

  const total =
    results.companies.length +
    results.contacts.length +
    results.deals.length;

  return (
    <div>
      <PageHeader
        title="Search"
        description={
          q.trim()
            ? `${total} result${total === 1 ? "" : "s"} for “${q}”`
            : "Type a query in the header search"
        }
      />

      {!q.trim() ? (
        <p className="text-sm text-zinc-500">
          Search companies, contacts, and deals from the top bar.
        </p>
      ) : total === 0 ? (
        <p className="text-sm text-zinc-500">No matches found.</p>
      ) : (
        <div className="space-y-6">
          {results.companies.length > 0 ? (
            <Section title="Companies">
              {results.companies.map((c) => (
                <ResultRow
                  key={c.id}
                  href={`/companies/${c.id}`}
                  title={c.name}
                  subtitle={c.domain || c.industry || undefined}
                />
              ))}
            </Section>
          ) : null}

          {results.contacts.length > 0 ? (
            <Section title="Contacts">
              {results.contacts.map((c) => (
                <ResultRow
                  key={c.id}
                  href={`/contacts/${c.id}`}
                  title={fullName(c.firstName, c.lastName)}
                  subtitle={
                    [c.email, c.company?.name].filter(Boolean).join(" · ") ||
                    undefined
                  }
                />
              ))}
            </Section>
          ) : null}

          {results.deals.length > 0 ? (
            <Section title="Deals">
              {results.deals.map((d) => (
                <ResultRow
                  key={d.id}
                  href={`/deals/${d.id}`}
                  title={d.title}
                  subtitle={`${formatCurrency(d.amountCents, d.currency)}${
                    d.company ? ` · ${d.company.name}` : ""
                  }`}
                  badge={d.stage.name}
                />
              ))}
            </Section>
          ) : null}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h2>
      <div className="overflow-hidden rounded-lg border border-zinc-200 divide-y divide-zinc-100">
        {children}
      </div>
    </div>
  );
}

function ResultRow({
  href,
  title,
  subtitle,
  badge,
}: {
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-zinc-50"
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-zinc-900">{title}</div>
        {subtitle ? (
          <div className="truncate text-xs text-zinc-500">{subtitle}</div>
        ) : null}
      </div>
      {badge ? <Badge variant="secondary">{badge}</Badge> : null}
    </Link>
  );
}
