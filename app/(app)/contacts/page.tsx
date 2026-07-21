import Link from "next/link";
import { listContacts } from "@/lib/actions/contacts";
import { listCompanies } from "@/lib/actions/companies";
import { requireMembership } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { QuickAddContactButton } from "@/components/contacts/quick-add-contact";
import { ContactImportExport } from "@/components/contacts/contact-import-export";
import { ContactsTable } from "@/components/contacts/contacts-table";

export default async function ContactsPage() {
  const [{ organization }, contacts, companies] = await Promise.all([
    requireMembership(),
    listContacts(),
    listCompanies(),
  ]);

  const companyOptions = companies.map((c) => ({
    id: c.id,
    name: c.name,
    domain: c.domain,
  }));

  const fmt = {
    locale: organization.locale,
    timezone: organization.timezone,
    dateFormat: organization.dateFormat,
  };

  return (
    <div>
      <PageHeader
        title="Contacts"
        description={`${contacts.length} total`}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <ContactImportExport />
            <Link
              href="/contacts/new"
              className="inline-flex h-8 items-center rounded-md border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
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
            Add a person, or import a CSV, Excel, JSON, or vCard file.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <ContactImportExport />
            <QuickAddContactButton companies={companyOptions} />
          </div>
        </div>
      ) : (
        <ContactsTable contacts={contacts} formatOpts={fmt} />
      )}
    </div>
  );
}
