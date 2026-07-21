/** Quote form defaults and presets */

export function addDaysISO(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function endOfMonthISO(from = new Date()): string {
  const d = new Date(from.getFullYear(), from.getMonth() + 1, 0, 12, 0, 0);
  return d.toISOString().slice(0, 10);
}

export const VALID_UNTIL_PRESETS = [
  { label: "7 days", days: 7 },
  { label: "14 days", days: 14 },
  { label: "30 days", days: 30 },
  { label: "60 days", days: 60 },
  { label: "90 days", days: 90 },
] as const;

export const TAX_PRESETS = [
  { label: "0%", value: "0" },
  { label: "5%", value: "5" },
  { label: "10%", value: "10" },
  { label: "20%", value: "20" },
] as const;

export const DEFAULT_QUOTE_TERMS = `Payment is due within 30 days of the invoice date.
Prices are valid until the date shown on this quote.
Work begins upon written acceptance of this quote.
Any changes to scope may affect pricing and timeline.`;

export const LINE_TEMPLATES = [
  {
    label: "Professional services",
    description: "Professional services",
    quantity: "1",
    unitPrice: "0",
  },
  {
    label: "Hourly consulting",
    description: "Consulting (hourly)",
    quantity: "10",
    unitPrice: "150",
  },
  {
    label: "Monthly retainer",
    description: "Monthly retainer",
    quantity: "1",
    unitPrice: "2500",
  },
  {
    label: "Setup / onboarding",
    description: "Setup and onboarding",
    quantity: "1",
    unitPrice: "500",
  },
  {
    label: "License (annual)",
    description: "Software license — annual",
    quantity: "1",
    unitPrice: "1200",
  },
] as const;

export function daysUntil(date: Date | string | null | undefined): number | null {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
