import Link from "next/link";
import {
  Building2,
  Contact,
  FileText,
  Handshake,
  Inbox,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type RelatedChip = {
  href: string;
  label: string;
  kind: "company" | "contact" | "deal" | "enquiry" | "quote";
  sublabel?: string;
};

const ICONS: Record<RelatedChip["kind"], LucideIcon> = {
  company: Building2,
  contact: Contact,
  deal: Handshake,
  enquiry: Inbox,
  quote: FileText,
};

/** Horizontal chips linking related CRM records */
export function RelatedContext({
  items,
  className,
}: {
  items: RelatedChip[];
  className?: string;
}) {
  const filtered = items.filter(Boolean);
  if (!filtered.length) return null;

  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center gap-2",
        className
      )}
    >
      <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
        Linked
      </span>
      {filtered.map((item) => {
        const Icon = ICONS[item.kind];
        return (
          <Link
            key={`${item.kind}-${item.href}`}
            href={item.href}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 shadow-sm transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900"
          >
            <Icon className="h-3 w-3 shrink-0 text-zinc-400" />
            <span className="truncate">{item.label}</span>
            {item.sublabel ? (
              <span className="truncate text-zinc-400">{item.sublabel}</span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

/** Compact related list card body */
export function RelatedList({
  title,
  hrefNew,
  newLabel,
  empty,
  children,
}: {
  title: string;
  hrefNew?: string;
  newLabel?: string;
  empty: string;
  children?: React.ReactNode;
}) {
  const hasKids =
    children != null &&
    !(Array.isArray(children) && children.length === 0);

  return (
    <div className="rounded-lg border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-2.5">
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {hrefNew ? (
          <Link
            href={hrefNew}
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
          >
            {newLabel ?? "Add"}
          </Link>
        ) : null}
      </div>
      <div className="px-4 py-2">
        {hasKids ? (
          <ul className="divide-y divide-zinc-100">{children}</ul>
        ) : (
          <p className="py-2 text-sm text-zinc-500">{empty}</p>
        )}
      </div>
    </div>
  );
}

export function RelatedListItem({
  href,
  title,
  meta,
  badge,
}: {
  href: string;
  title: string;
  meta?: string;
  badge?: React.ReactNode;
}) {
  return (
    <li className="flex items-center justify-between gap-2 py-2">
      <div className="min-w-0">
        <Link
          href={href}
          className="text-sm font-medium text-zinc-900 hover:underline"
        >
          {title}
        </Link>
        {meta ? (
          <div className="truncate text-xs text-zinc-500">{meta}</div>
        ) : null}
      </div>
      {badge}
    </li>
  );
}
