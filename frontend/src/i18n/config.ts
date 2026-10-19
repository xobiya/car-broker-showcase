export const locales = ["en", "am", "om"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export interface LocaleMeta {
  code: Locale;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  flag: string;
  ethiopianCalendar?: boolean;
}

export const localeMetadata: Record<Locale, LocaleMeta> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
    flag: "🇺🇸"
  },
  am: {
    code: "am",
    name: "Amharic",
    nativeName: "አማርኛ",
    dir: "ltr",
    flag: "🇪🇹",
    ethiopianCalendar: true
  },
  om: {
    code: "om",
    name: "Afaan Oromo",
    nativeName: "Afaan Oromoo",
    dir: "ltr",
    flag: "🇪🇹"
  }
} as const;

export const LOCALE_STORAGE_KEY = "autobroker_locale";
