import { DEFAULT_ORG_SETTINGS } from "@/lib/settings-options";

/** Map an organization row to form-friendly string values. */
export function orgToFormValues(organization: {
  name: string;
  timezone: string | null;
  currency: string | null;
  locale: string | null;
  dateFormat: string | null;
  weekStartsOn: number | null;
  fiscalYearStartMonth: number | null;
  legalName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  country: string | null;
  taxId: string | null;
  quoteFooter: string | null;
  logoUrl: string | null;
}) {
  return {
    name: organization.name,
    timezone: organization.timezone ?? DEFAULT_ORG_SETTINGS.timezone,
    currency: organization.currency ?? DEFAULT_ORG_SETTINGS.currency,
    locale: organization.locale ?? DEFAULT_ORG_SETTINGS.locale,
    dateFormat: organization.dateFormat ?? DEFAULT_ORG_SETTINGS.dateFormat,
    weekStartsOn:
      organization.weekStartsOn ?? DEFAULT_ORG_SETTINGS.weekStartsOn,
    fiscalYearStartMonth:
      organization.fiscalYearStartMonth ??
      DEFAULT_ORG_SETTINGS.fiscalYearStartMonth,
    legalName: organization.legalName ?? "",
    email: organization.email ?? "",
    phone: organization.phone ?? "",
    website: organization.website ?? "",
    addressLine1: organization.addressLine1 ?? "",
    addressLine2: organization.addressLine2 ?? "",
    city: organization.city ?? "",
    region: organization.region ?? "",
    postalCode: organization.postalCode ?? "",
    country: organization.country ?? "",
    taxId: organization.taxId ?? "",
    quoteFooter: organization.quoteFooter ?? "",
    logoUrl: organization.logoUrl ?? null,
  };
}
