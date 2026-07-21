import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type FormatOptions = {
  locale?: string;
  timezone?: string;
  dateFormat?: "short" | "medium" | "long" | "full" | string;
};

export function formatCurrency(
  amountCents: number,
  currency = "USD",
  locale = "en-US"
) {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" || currency === "KRW" ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(amountCents / 100);
  } catch {
    return `${(amountCents / 100).toFixed(2)} ${currency}`;
  }
}

export function formatDate(
  date: Date | string | null | undefined,
  options: FormatOptions = {}
) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";

  const locale = options.locale ?? "en-US";
  const dateStyle = (options.dateFormat ?? "medium") as
    | "short"
    | "medium"
    | "long"
    | "full";

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle:
        dateStyle === "short" ||
        dateStyle === "medium" ||
        dateStyle === "long" ||
        dateStyle === "full"
          ? dateStyle
          : "medium",
      timeZone: options.timezone || undefined,
    }).format(d);
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  }
}

export function formatDateTime(
  date: Date | string | null | undefined,
  options: FormatOptions = {}
) {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";

  try {
    return new Intl.DateTimeFormat(options.locale ?? "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: options.timezone || undefined,
    }).format(d);
  } catch {
    return formatDate(date, options);
  }
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function fullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}
