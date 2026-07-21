"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { makeBulkDeleteAction } from "@/components/data-table/bulk-delete";
import type { DataTableColumn } from "@/components/data-table/types";
import { deleteQuotes } from "@/lib/actions/quotes";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { daysUntil } from "@/lib/quotes/defaults";

const statusVariant: Record<
  string,
  "secondary" | "success" | "danger" | "outline"
> = {
  draft: "secondary",
  sent: "outline",
  accepted: "success",
  rejected: "danger",
  expired: "secondary",
};

export type QuoteRow = {
  id: string;
  number: string;
  title: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string | Date;
  validUntil: string | Date | null;
  billToName: string | null;
  billToCompany: string | null;
  company: { id: string; name: string } | null;
  enquiry: { id: string; title: string } | null;
};

export function QuotesTable({
  quotes,
  locale,
  formatOpts,
}: {
  quotes: QuoteRow[];
  locale: string;
  formatOpts?: { locale?: string; timezone?: string; dateFormat?: string };
}) {
  const columns: DataTableColumn<QuoteRow>[] = [
    {
      id: "number",
      header: "Number",
      hideable: false,
      getValue: (r) => r.number,
      cell: (r) => (
        <Link
          href={`/quotes/${r.id}`}
          className="font-medium text-zinc-900 hover:underline"
        >
          {r.number}
        </Link>
      ),
      filterType: "text",
    },
    {
      id: "title",
      header: "Title",
      getValue: (r) => r.title,
      cell: (r) => r.title,
      filterType: "text",
    },
    {
      id: "customer",
      header: "Customer",
      getValue: (r) =>
        r.billToCompany || r.company?.name || r.billToName || "",
      cell: (r) =>
        r.billToCompany || r.company?.name || r.billToName || "—",
      filterType: "text",
    },
    {
      id: "enquiry",
      header: "Enquiry",
      defaultVisible: false,
      getValue: (r) => r.enquiry?.title ?? "",
      cell: (r) =>
        r.enquiry ? (
          <Link
            href={`/enquiries/${r.enquiry.id}`}
            className="hover:underline"
          >
            {r.enquiry.title}
          </Link>
        ) : (
          "—"
        ),
      filterType: "text",
    },
    {
      id: "total",
      header: "Total",
      getValue: (r) => String(r.totalCents),
      cell: (r) => formatCurrency(r.totalCents, r.currency, locale),
    },
    {
      id: "status",
      header: "Status",
      getValue: (r) => r.status,
      cell: (r) => (
        <div className="flex flex-wrap items-center gap-1">
          <Badge
            variant={statusVariant[r.status] ?? "secondary"}
            className="capitalize"
          >
            {r.status}
          </Badge>
          {(() => {
            const d = daysUntil(r.validUntil);
            if (
              d === null ||
              r.status === "accepted" ||
              r.status === "rejected"
            )
              return null;
            if (d < 0)
              return <Badge variant="danger">Expired</Badge>;
            if (d <= 7)
              return (
                <Badge variant="outline">
                  {d === 0 ? "Today" : `${d}d left`}
                </Badge>
              );
            return null;
          })()}
        </div>
      ),
      filterType: "select",
      filterOptions: [
        { label: "Draft", value: "draft" },
        { label: "Sent", value: "sent" },
        { label: "Accepted", value: "accepted" },
        { label: "Rejected", value: "rejected" },
        { label: "Expired", value: "expired" },
      ],
    },
    {
      id: "validUntil",
      header: "Valid until",
      getValue: (r) =>
        r.validUntil ? new Date(r.validUntil).toISOString() : "",
      cell: (r) => formatDate(r.validUntil, formatOpts),
    },
    {
      id: "created",
      header: "Created",
      getValue: (r) =>
        r.createdAt ? new Date(r.createdAt).toISOString() : "",
      cell: (r) => formatDate(r.createdAt, formatOpts),
    },
  ];

  const resourceLabels = { singular: "quote", plural: "quotes" };
  const bulkActions = useMemo(
    () => [makeBulkDeleteAction(resourceLabels, deleteQuotes)],
    []
  );

  return (
    <DataTable
      tableId="quotes"
      columns={columns}
      rows={quotes}
      searchPlaceholder="Search quotes…"
      resourceLabels={resourceLabels}
      bulkActions={bulkActions}
    />
  );
}
