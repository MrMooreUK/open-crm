"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { makeBulkDeleteAction } from "@/components/data-table/bulk-delete";
import type { DataTableColumn } from "@/components/data-table/types";
import { deleteDeals } from "@/lib/actions/deals";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

const DEAL_LABELS = { singular: "deal", plural: "deals" } as const;

export type DealRow = {
  id: string;
  title: string;
  amountCents: number;
  currency: string;
  expectedCloseAt: string | Date | null;
  notes: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  company: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  owner: { id: string; name: string; email: string } | null;
  stage: { id: string; name: string; isWon: boolean; isLost: boolean };
};

export function DealsTable({
  deals,
  locale,
  formatOpts,
}: {
  deals: DealRow[];
  locale: string;
  formatOpts?: { locale?: string; timezone?: string; dateFormat?: string };
}) {
  const stages = Array.from(new Set(deals.map((d) => d.stage.name)))
    .sort()
    .map((name) => ({ label: name, value: name.toLowerCase() }));

  const companies = Array.from(
    new Set(deals.map((d) => d.company?.name).filter(Boolean) as string[])
  )
    .sort()
    .map((name) => ({ label: name, value: name.toLowerCase() }));

  const columns: DataTableColumn<DealRow>[] = [
    {
      id: "title",
      header: "Deal",
      hideable: false,
      getValue: (r) => r.title,
      cell: (r) => (
        <Link
          href={`/deals/${r.id}`}
          className="font-medium text-zinc-900 hover:underline"
        >
          {r.title}
        </Link>
      ),
      filterType: "text",
    },
    {
      id: "company",
      header: "Company",
      getValue: (r) => r.company?.name ?? "",
      cell: (r) => r.company?.name || "—",
      filterType: companies.length ? "select" : "text",
      filterOptions: companies,
    },
    {
      id: "contact",
      header: "Contact",
      defaultVisible: false,
      getValue: (r) =>
        r.contact
          ? `${r.contact.firstName} ${r.contact.lastName}`.trim()
          : "",
      cell: (r) =>
        r.contact
          ? `${r.contact.firstName} ${r.contact.lastName}`.trim()
          : "—",
      filterType: "text",
    },
    {
      id: "amount",
      header: "Amount",
      getValue: (r) => String(r.amountCents),
      cell: (r) => formatCurrency(r.amountCents, r.currency, locale),
    },
    {
      id: "stage",
      header: "Stage",
      getValue: (r) => r.stage.name,
      cell: (r) => (
        <Badge
          variant={
            r.stage.isWon ? "success" : r.stage.isLost ? "danger" : "secondary"
          }
        >
          {r.stage.name}
        </Badge>
      ),
      filterType: "select",
      filterOptions: stages,
    },
    {
      id: "assignee",
      header: "Assigned to",
      getValue: (r) => r.owner?.name ?? "unassigned",
      cell: (r) => r.owner?.name || "—",
      filterType: "select",
      filterOptions: Array.from(
        new Set(deals.map((d) => d.owner?.name).filter(Boolean) as string[])
      )
        .sort()
        .map((name) => ({ label: name, value: name.toLowerCase() }))
        .concat([{ label: "Unassigned", value: "unassigned" }]),
    },
    {
      id: "close",
      header: "Close",
      getValue: (r) =>
        r.expectedCloseAt
          ? new Date(r.expectedCloseAt).toISOString()
          : "",
      cell: (r) => formatDate(r.expectedCloseAt, formatOpts),
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
  ];

  const bulkActions = useMemo(
    () => [makeBulkDeleteAction(DEAL_LABELS, deleteDeals)],
    []
  );

  return (
    <DataTable
      tableId="deals"
      columns={columns}
      rows={deals}
      searchPlaceholder="Search deals…"
      resourceLabels={DEAL_LABELS}
      bulkActions={bulkActions}
    />
  );
}
