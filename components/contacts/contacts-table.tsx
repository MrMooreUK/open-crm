"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { makeBulkDeleteAction } from "@/components/data-table/bulk-delete";
import type { DataTableColumn } from "@/components/data-table/types";
import { deleteContacts } from "@/lib/actions/contacts";
import { fullName, formatDate } from "@/lib/utils";

export type ContactRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  company: { id: string; name: string } | null;
};

export function ContactsTable({
  contacts,
  formatOpts,
}: {
  contacts: ContactRow[];
  formatOpts?: { locale?: string; timezone?: string; dateFormat?: string };
}) {
  const companyOptions = Array.from(
    new Set(contacts.map((c) => c.company?.name).filter(Boolean) as string[])
  )
    .sort()
    .map((name) => ({ label: name, value: name.toLowerCase() }));

  const columns: DataTableColumn<ContactRow>[] = [
    {
      id: "name",
      header: "Name",
      hideable: false,
      getValue: (r) => fullName(r.firstName, r.lastName),
      cell: (r) => (
        <Link
          href={`/contacts/${r.id}`}
          className="font-medium text-zinc-900 hover:underline"
        >
          {fullName(r.firstName, r.lastName)}
        </Link>
      ),
      filterType: "text",
    },
    {
      id: "email",
      header: "Email",
      getValue: (r) => r.email ?? "",
      cell: (r) => r.email || "—",
      filterType: "text",
    },
    {
      id: "phone",
      header: "Phone",
      defaultVisible: false,
      getValue: (r) => r.phone ?? "",
      cell: (r) => r.phone || "—",
      filterType: "text",
    },
    {
      id: "company",
      header: "Company",
      getValue: (r) => r.company?.name ?? "",
      cell: (r) =>
        r.company ? (
          <Link
            href={`/companies/${r.company.id}`}
            className="hover:underline"
          >
            {r.company.name}
          </Link>
        ) : (
          "—"
        ),
      filterType: companyOptions.length ? "select" : "text",
      filterOptions: companyOptions,
    },
    {
      id: "title",
      header: "Title",
      getValue: (r) => r.title ?? "",
      cell: (r) => r.title || "—",
      filterType: "text",
    },
    {
      id: "notes",
      header: "Notes",
      defaultVisible: false,
      getValue: (r) => r.notes ?? "",
      cell: (r) => (
        <span className="line-clamp-1 max-w-[200px]">{r.notes || "—"}</span>
      ),
      filterType: "text",
    },
    {
      id: "updated",
      header: "Updated",
      defaultVisible: false,
      getValue: (r) =>
        r.updatedAt ? new Date(r.updatedAt).toISOString() : "",
      cell: (r) => formatDate(r.updatedAt, formatOpts),
    },
    {
      id: "created",
      header: "Created",
      defaultVisible: false,
      getValue: (r) =>
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
      cell: (r) => formatDate(r.createdAt, formatOpts),
    },
  ];

  const resourceLabels = { singular: "contact", plural: "contacts" };
  const bulkActions = useMemo(
    () => [makeBulkDeleteAction(resourceLabels, deleteContacts)],
    []
  );

  return (
    <DataTable
      tableId="contacts"
      columns={columns}
      rows={contacts}
      searchPlaceholder="Search contacts…"
      resourceLabels={resourceLabels}
      bulkActions={bulkActions}
    />
  );
}
