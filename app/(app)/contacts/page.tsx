import Link from "next/link";
import { listContacts } from "@/lib/actions/contacts";
import { listCompanies } from "@/lib/actions/companies";
import { PageHeader } from "@/components/ui/page-header";
import { fullName } from "@/lib/utils";
import { QuickAddContactButton } from "@/components/contacts/quick-add-contact";

export default async function ContactsPage() {
  const [contacts, companies] = await Promise.all([
    listContacts(),
    listCompanies(),
  ]);

  const companyOptions = companies.map((c) => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
  }));

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} total`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/contacts/new"
              className="inline-flex h-9 items-center rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Full form
            </Link>
            <QuickAddContactButton companies={companyOptions} />
          </div>
        }
      />

      {contacts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center">
          <h3 className="text-sm font-medium text-zinc-900">No contacts yet</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Add a person in a few seconds — name, email, company.
          </p>
          <div className="mt-4 flex justify-center">
            <QuickAddContactButton companies={companyOptions} />
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Company</th>
                <th className="px-3 py-2">Title</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-zinc-50/80">
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/contacts/${c.id}`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {fullName(c.firstName, c.lastName)}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-zinc-600">{c.email || "—"}</td>
                  <td className="px-3 py-2.5 text-zinc-600">
                    {c.company ? (
                      <Link
                        href={`/companies/${c.company.id}`}
                        className="hover:underline"
                      >
                        {c.company.name}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-zinc-600">{c.title || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
