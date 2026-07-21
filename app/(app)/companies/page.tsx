import Link from "next/link";
import { listCompanies } from "@/lib/actions/companies";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { CompaniesTable } from "@/components/companies/companies-table";

export default async function CompaniesPage() {
  const [{ organization }, companies] = await Promise.all([
    requireMembership(),
    listCompanies(),
  ]);

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  return (
    <div>
      <PageHeader
        title="Companies"
        description={`${companies.length} total`}
        actions={
          <Link
            href="/companies/new"
            className="inline-flex h-9 items-center rounded-md bg-zinc-900 px-3.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New company
          </Link>
        }
      />

      {companies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
          <h3 className="text-sm font-medium text-zinc-900">No companies yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Add accounts you sell to or work with.
          </p>
          <Link
            href="/companies/new"
            className="mt-4 inline-flex h-8 items-center rounded-md bg-zinc-900 px-3 text-xs font-medium text-white hover:bg-zinc-800"
          >
            New company
          </Link>
        </div>
      ) : (
        <CompaniesTable companies={companies} formatOpts={fmt} />
      )}
    </div>
  );
}
