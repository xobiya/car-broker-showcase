import { Locale, defaultLocale } from "./config";

/**
 * Locale-aware Ethiopian Birr & global currency formatter
 * E.g., in English: "ETB 2,500,000"
 * In Amharic: "2,500,000 ብር"
 * In Afaan Oromoo: "ETB 2,500,000"
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "ETB",
  locale: Locale = defaultLocale
): string {
  if (amount == null || isNaN(amount)) return "0 ETB";

  const formattedNumber = new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-US", {
    maximumFractionDigits: 0
  }).format(amount);

  if (currency === "ETB") {
    if (locale === "am") {
      return `${formattedNumber} ብር`;
    }
    return `${formattedNumber} ETB`;
  }

  return `${formattedNumber} ${currency}`;
}

/**
 * Locale-aware number formatter with correct thousand separators
 */
export function formatNumber(
  value: number | null | undefined,
  locale: Locale = defaultLocale,
  options?: Intl.NumberFormatOptions
): string {
  if (value == null || isNaN(value)) return "0";
  return new Intl.NumberFormat(locale === "am" ? "am-ET" : "en-US", options).format(value);
}

/**
 * Locale-aware date formatter
 */
export function formatDate(
  dateInput: string | number | Date,
  locale: Locale = defaultLocale,
  options?: Intl.DateTimeFormatOptions
): string {
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return String(dateInput);

    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options
    };

    const intlLocale = locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-US";
    return new Intl.DateTimeFormat(intlLocale, defaultOptions).format(date);
  } catch {
    return String(dateInput);
  }
}
