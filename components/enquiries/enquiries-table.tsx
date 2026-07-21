"use client";

import Link from "next/link";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { makeBulkDeleteAction } from "@/components/data-table/bulk-delete";
import type { DataTableColumn } from "@/components/data-table/types";
import { deleteEnquiries } from "@/lib/actions/enquiries";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<
  string,
  "secondary" | "success" | "danger" | "outline"
> = {
  new: "secondary",
  in_progress: "outline",
  quoted: "outline",
  won: "success",
  lost: "danger",
  closed: "secondary",
};

export type EnquiryRow = {
  id: string;
  title: string;
  status: string;
  source: string;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  message: string | null;
  updatedAt: string | Date;
  createdAt: string | Date;
  company: { id: string; name: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  owner: { id: string; name: string; email: string } | null;
  quotes: { id: string }[];
};

export function EnquiriesTable({
  enquiries,
  formatOpts,
}: {
  enquiries: EnquiryRow[];
  formatOpts?: { locale?: string; timezone?: string; dateFormat?: string };
}) {
  const columns: DataTableColumn<EnquiryRow>[] = [
    {
      id: "title",
      header: "Subject",
      hideable: false,
      getValue: (r) => r.title,
      cell: (r) => (
        <Link
          href={`/enquiries/${r.id}`}
          className="font-medium text-zinc-900 hover:underline"
        >
          {r.title}
        </Link>
      ),
      filterType: "text",
    },
    {
      id: "contact",
      header: "Contact",
      getValue: (r) =>
        r.contact
          ? `${r.contact.firstName} ${r.contact.lastName}`
          : r.contactName || r.contactEmail || "",
      cell: (r) =>
        r.contact
          ? `${r.contact.firstName} ${r.contact.lastName}`
          : r.contactName || r.contactEmail || "—",
      filterType: "text",
    },
    {
      id: "email",
      header: "Email",
      defaultVisible: false,
      getValue: (r) => r.contactEmail ?? "",
      cell: (r) => r.contactEmail || "—",
      filterType: "text",
    },
    {
      id: "company",
      header: "Company",
      defaultVisible: false,
      getValue: (r) => r.company?.name ?? "",
      cell: (r) => r.company?.name || "—",
      filterType: "text",
    },
    {
      id: "source",
      header: "Source",
      getValue: (r) => r.source,
      cell: (r) => (
        <span className="capitalize">{r.source.replace("_", " ")}</span>
      ),
      filterType: "select",
      filterOptions: [
        { label: "Web", value: "web" },
        { label: "Email", value: "email" },
        { label: "Phone", value: "phone" },
        { label: "Referral", value: "referral" },
        { label: "Other", value: "other" },
      ],
    },
    {
      id: "status",
      header: "Status",
      getValue: (r) => r.status,
      cell: (r) => (
        <Badge
          variant={statusVariant[r.status] ?? "secondary"}
          className="capitalize"
        >
          {r.status.replace("_", " ")}
        </Badge>
      ),
      filterType: "select",
      filterOptions: [
        { label: "New", value: "new" },
        { label: "In progress", value: "in_progress" },
        { label: "Quoted", value: "quoted" },
        { label: "Won", value: "won" },
        { label: "Lost", value: "lost" },
        { label: "Closed", value: "closed" },
      ],
    },
    {
      id: "assignee",
      header: "Assigned to",
      getValue: (r) => r.owner?.name ?? "unassigned",
      cell: (r) => r.owner?.name || "—",
      filterType: "select",
      filterOptions: Array.from(
        new Set(
          enquiries
            .map((e) => e.owner?.name)
            .filter(Boolean) as string[]
        )
      )
        .sort()
        .map((name) => ({ label: name, value: name.toLowerCase() }))
        .concat([{ label: "Unassigned", value: "unassigned" }]),
    },
    {
      id: "quotes",
      header: "Quotes",
      getValue: (r) => String(r.quotes?.length ?? 0),
      cell: (r) => String(r.quotes?.length ?? 0),
    },
    {
      id: "message",
      header: "Message",
      defaultVisible: false,
      getValue: (r) => r.message ?? "",
      cell: (r) => (
        <span className="line-clamp-1 max-w-[220px]">{r.message || "—"}</span>
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
  ];

  const resourceLabels = { singular: "enquiry", plural: "enquiries" };
  const bulkActions = useMemo(
    () => [makeBulkDeleteAction(resourceLabels, deleteEnquiries)],
    []
  );

  return (
    <DataTable
      tableId="enquiries"
      columns={columns}
      rows={enquiries}
      searchPlaceholder="Search enquiries…"
      resourceLabels={resourceLabels}
      bulkActions={bulkActions}
    />
  );
}
