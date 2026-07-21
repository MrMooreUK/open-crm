import Link from "next/link";
import { listCompanies } from "@/lib/actions/companies";
import { PageHeader } from "@/components/ui/page-header";
import { formatDate } from "@/lib/utils";

export default async function CompaniesPage() {
  const companies = await listCompanies();

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
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Industry</th>
                <th className="px-3 py-2">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/80">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/companies/${c.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-600">{c.domain || "—"}</td>
                  <td className="px-3 py-2.5 text-zinc-600">
                    {c.industry || "—"}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-500">
                    {formatDate(c.updatedAt)}
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
