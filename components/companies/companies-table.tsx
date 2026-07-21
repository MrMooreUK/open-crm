"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { makeBulkDeleteAction } from "@/components/data-table/bulk-delete";
import type { DataTableColumn } from "@/components/data-table/types";
import { deleteCompanies } from "@/lib/actions/companies";
import { formatDate } from "@/lib/utils";

const COMPANY_LABELS = { singular: "company", plural: "companies" } as const;

export type CompanyRow = {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  website: string | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export function CompaniesTable({
  companies,
  formatOpts,
}: {
  companies: CompanyRow[];
  formatOpts?: { locale?: string; timezone?: string; dateFormat?: string };
}) {
  const industries = Array.from(
    new Set(companies.map((c) => c.industry).filter(Boolean) as string[])
  )
    .sort()
    .map((name) => ({ label: name, value: name.toLowerCase() }));

  const columns: DataTableColumn<CompanyRow>[] = [
    {
      id: "name",
      header: "Name",
      hideable: false,
      getValue: (r) => r.name,
      cell: (r) => (
        <Link
          href={`/companies/${r.id}`}
          className="font-medium text-zinc-900 hover:underline"
        >
          {r.name}
        </Link>
      ),
      filterType: "text",
    },
    {
      id: "domain",
      header: "Domain",
      getValue: (r) => r.domain ?? "",
      cell: (r) => r.domain || "—",
      filterType: "text",
    },
    {
      id: "industry",
      header: "Industry",
      getValue: (r) => r.industry ?? "",
      cell: (r) => r.industry || "—",
      filterType: industries.length ? "select" : "text",
      filterOptions: industries,
    },
    {
      id: "website",
      header: "Website",
      defaultVisible: false,
      getValue: (r) => r.website ?? "",
      cell: (r) =>
        r.website ? (
          <a
            href={r.website.startsWith("http") ? r.website : `https://${r.website}`}
            target="_blank"
            rel="noreferrer"
            className="hover:underline"
          >
            {r.website}
          </a>
        ) : (
          "—"
        ),
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

  const bulkActions = useMemo(
    () => [makeBulkDeleteAction(COMPANY_LABELS, deleteCompanies)],
    []
  );

  return (
    <DataTable
      tableId="companies"
      columns={columns}
      rows={companies}
      searchPlaceholder="Search companies…"
      resourceLabels={COMPANY_LABELS}
      bulkActions={bulkActions}
    />
  );
}
