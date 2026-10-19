import { useTranslation } from "react-i18next";
import { Locale, defaultLocale, locales, localeMetadata, LocaleMeta } from "./config";
import { formatCurrency as formatCurrencyUtil, formatNumber as formatNumberUtil, formatDate as formatDateUtil } from "./formatters";

export function useLocale() {
  const { i18n } = useTranslation();
  const currentLocale: Locale = (locales as readonly string[]).includes(i18n.language)
    ? (i18n.language as Locale)
    : defaultLocale;

  const setLocale = (newLocale: Locale) => {
    if ((locales as readonly string[]).includes(newLocale)) {
      i18n.changeLanguage(newLocale);
    }
  };

  const meta: LocaleMeta = localeMetadata[currentLocale] || localeMetadata[defaultLocale];

  const formatCurrency = (amount: number | null | undefined, currency?: string) =>
    formatCurrencyUtil(amount, currency, currentLocale);

  const formatNumber = (value: number | null | undefined, options?: Intl.NumberFormatOptions) =>
    formatNumberUtil(value, currentLocale, options);

  const formatDate = (date: string | number | Date, options?: Intl.DateTimeFormatOptions) =>
    formatDateUtil(date, currentLocale, options);

  return {
    locale: currentLocale,
    setLocale,
    meta,
    locales,
    localeMetadata,
    formatCurrency,
    formatNumber,
    formatDate
  };
}
