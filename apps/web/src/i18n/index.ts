import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Locale, defaultLocale, locales, localeMetadata, LOCALE_STORAGE_KEY } from "./config";

// English namespaces
import enCommon from "../messages/en/common.json";
import enNavigation from "../messages/en/navigation.json";
import enHomepage from "../messages/en/homepage.json";
import enAuthentication from "../messages/en/authentication.json";
import enVehicles from "../messages/en/vehicles.json";
import enComparison from "../messages/en/comparison.json";
import enServices from "../messages/en/services.json";
import enForms from "../messages/en/forms.json";
import enValidation from "../messages/en/validation.json";
import enNotifications from "../messages/en/notifications.json";
import enMetadata from "../messages/en/metadata.json";

// Amharic namespaces
import amCommon from "../messages/am/common.json";
import amNavigation from "../messages/am/navigation.json";
import amHomepage from "../messages/am/homepage.json";
import amAuthentication from "../messages/am/authentication.json";
import amVehicles from "../messages/am/vehicles.json";
import amComparison from "../messages/am/comparison.json";
import amServices from "../messages/am/services.json";
import amForms from "../messages/am/forms.json";
import amValidation from "../messages/am/validation.json";
import amNotifications from "../messages/am/notifications.json";
import amMetadata from "../messages/am/metadata.json";

// Afaan Oromoo namespaces
import omCommon from "../messages/om/common.json";
import omNavigation from "../messages/om/navigation.json";
import omHomepage from "../messages/om/homepage.json";
import omAuthentication from "../messages/om/authentication.json";
import omVehicles from "../messages/om/vehicles.json";
import omComparison from "../messages/om/comparison.json";
import omServices from "../messages/om/services.json";
import omForms from "../messages/om/forms.json";
import omValidation from "../messages/om/validation.json";
import omNotifications from "../messages/om/notifications.json";
import omMetadata from "../messages/om/metadata.json";

export const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    homepage: enHomepage,
    authentication: enAuthentication,
    vehicles: enVehicles,
    comparison: enComparison,
    services: enServices,
    forms: enForms,
    validation: enValidation,
    notifications: enNotifications,
    metadata: enMetadata
  },
  am: {
    common: amCommon,
    navigation: amNavigation,
    homepage: amHomepage,
    authentication: amAuthentication,
    vehicles: amVehicles,
    comparison: amComparison,
    services: amServices,
    forms: amForms,
    validation: amValidation,
    notifications: amNotifications,
    metadata: amMetadata
  },
  om: {
    common: omCommon,
    navigation: omNavigation,
    homepage: omHomepage,
    authentication: omAuthentication,
    vehicles: omVehicles,
    comparison: omComparison,
    services: omServices,
    forms: omForms,
    validation: omValidation,
    notifications: omNotifications,
    metadata: omMetadata
  }
} as const;

export function getSavedLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale;
    if (saved && (locales as readonly string[]).includes(saved)) {
      return saved;
    }
  } catch {}
  return defaultLocale;
}

const initialLocale = getSavedLocale();

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLocale,
    fallbackLng: defaultLocale,
    ns: [
      "common",
      "navigation",
      "homepage",
      "authentication",
      "vehicles",
      "comparison",
      "services",
      "forms",
      "validation",
      "notifications",
      "metadata"
    ],
    defaultNS: "common",
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

// Apply document language and direction
if (typeof document !== "undefined") {
  document.documentElement.lang = initialLocale;
  document.documentElement.dir = localeMetadata[initialLocale]?.dir || "ltr";
}

i18n.on("languageChanged", (lng: string) => {
  const validLocale = (locales as readonly string[]).includes(lng) ? (lng as Locale) : defaultLocale;
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, validLocale);
    if (typeof document !== "undefined") {
      document.documentElement.lang = validLocale;
      document.documentElement.dir = localeMetadata[validLocale]?.dir || "ltr";
    }
  } catch {}
});

export default i18n;
export * from "./config";
export * from "./formatters";
