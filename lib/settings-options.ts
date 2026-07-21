/** Common org settings option lists for selects */

export const CURRENCIES = [
  { code: "USD", label: "US Dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
  { code: "GBP", label: "British Pound (GBP)" },
  { code: "CAD", label: "Canadian Dollar (CAD)" },
  { code: "AUD", label: "Australian Dollar (AUD)" },
  { code: "NZD", label: "New Zealand Dollar (NZD)" },
  { code: "CHF", label: "Swiss Franc (CHF)" },
  { code: "JPY", label: "Japanese Yen (JPY)" },
  { code: "CNY", label: "Chinese Yuan (CNY)" },
  { code: "INR", label: "Indian Rupee (INR)" },
  { code: "SGD", label: "Singapore Dollar (SGD)" },
  { code: "HKD", label: "Hong Kong Dollar (HKD)" },
  { code: "SEK", label: "Swedish Krona (SEK)" },
  { code: "NOK", label: "Norwegian Krone (NOK)" },
  { code: "DKK", label: "Danish Krone (DKK)" },
  { code: "PLN", label: "Polish Zloty (PLN)" },
  { code: "BRL", label: "Brazilian Real (BRL)" },
  { code: "MXN", label: "Mexican Peso (MXN)" },
  { code: "ZAR", label: "South African Rand (ZAR)" },
  { code: "AED", label: "UAE Dirham (AED)" },
  { code: "SAR", label: "Saudi Riyal (SAR)" },
  { code: "KRW", label: "South Korean Won (KRW)" },
] as const;

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Pacific/Honolulu", label: "Hawaii (Pacific/Honolulu)" },
  { value: "America/Anchorage", label: "Alaska (America/Anchorage)" },
  { value: "America/Los_Angeles", label: "Pacific Time (America/Los_Angeles)" },
  { value: "America/Denver", label: "Mountain Time (America/Denver)" },
  { value: "America/Chicago", label: "Central Time (America/Chicago)" },
  { value: "America/New_York", label: "Eastern Time (America/New_York)" },
  { value: "America/Toronto", label: "Toronto (America/Toronto)" },
  { value: "America/Mexico_City", label: "Mexico City (America/Mexico_City)" },
  { value: "America/Sao_Paulo", label: "São Paulo (America/Sao_Paulo)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires" },
  { value: "Europe/London", label: "London (Europe/London)" },
  { value: "Europe/Dublin", label: "Dublin (Europe/Dublin)" },
  { value: "Europe/Paris", label: "Paris (Europe/Paris)" },
  { value: "Europe/Berlin", label: "Berlin (Europe/Berlin)" },
  { value: "Europe/Amsterdam", label: "Amsterdam (Europe/Amsterdam)" },
  { value: "Europe/Madrid", label: "Madrid (Europe/Madrid)" },
  { value: "Europe/Rome", label: "Rome (Europe/Rome)" },
  { value: "Europe/Stockholm", label: "Stockholm (Europe/Stockholm)" },
  { value: "Europe/Warsaw", label: "Warsaw (Europe/Warsaw)" },
  { value: "Europe/Istanbul", label: "Istanbul (Europe/Istanbul)" },
  { value: "Europe/Moscow", label: "Moscow (Europe/Moscow)" },
  { value: "Africa/Cairo", label: "Cairo (Africa/Cairo)" },
  { value: "Africa/Johannesburg", label: "Johannesburg (Africa/Johannesburg)" },
  { value: "Asia/Dubai", label: "Dubai (Asia/Dubai)" },
  { value: "Asia/Kolkata", label: "India (Asia/Kolkata)" },
  { value: "Asia/Bangkok", label: "Bangkok (Asia/Bangkok)" },
  { value: "Asia/Singapore", label: "Singapore (Asia/Singapore)" },
  { value: "Asia/Hong_Kong", label: "Hong Kong (Asia/Hong_Kong)" },
  { value: "Asia/Shanghai", label: "Shanghai (Asia/Shanghai)" },
  { value: "Asia/Tokyo", label: "Tokyo (Asia/Tokyo)" },
  { value: "Asia/Seoul", label: "Seoul (Asia/Seoul)" },
  { value: "Australia/Perth", label: "Perth (Australia/Perth)" },
  { value: "Australia/Sydney", label: "Sydney (Australia/Sydney)" },
  { value: "Pacific/Auckland", label: "Auckland (Pacific/Auckland)" },
] as const;

export const LOCALES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-AU", label: "English (Australia)" },
  { value: "en-CA", label: "English (Canada)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "fr-CA", label: "French (Canada)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "pt-PT", label: "Portuguese (Portugal)" },
  { value: "it-IT", label: "Italian (Italy)" },
  { value: "nl-NL", label: "Dutch (Netherlands)" },
  { value: "pl-PL", label: "Polish (Poland)" },
  { value: "sv-SE", label: "Swedish (Sweden)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "ko-KR", label: "Korean (Korea)" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "zh-TW", label: "Chinese (Traditional)" },
  { value: "ar-AE", label: "Arabic (UAE)" },
  { value: "hi-IN", label: "Hindi (India)" },
] as const;

export const DATE_FORMATS = [
  { value: "short", label: "Short", example: "3/15/26" },
  { value: "medium", label: "Medium", example: "Mar 15, 2026" },
  { value: "long", label: "Long", example: "March 15, 2026" },
  { value: "full", label: "Full", example: "Sunday, March 15, 2026" },
] as const;

export const WEEK_STARTS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 6, label: "Saturday" },
] as const;

export const FISCAL_YEAR_MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
] as const;

export type OrgSettings = {
  timezone: string;
  currency: string;
  locale: string;
  dateFormat: string;
  weekStartsOn: number;
  fiscalYearStartMonth: number;
};

export const DEFAULT_ORG_SETTINGS: OrgSettings = {
  timezone: "UTC",
  currency: "USD",
  locale: "en-US",
  dateFormat: "medium",
  weekStartsOn: 1,
  fiscalYearStartMonth: 1,
};
