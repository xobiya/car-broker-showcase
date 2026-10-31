import { describe, it, expect } from "vitest";
import { resources, defaultLocale, locales, localeMetadata } from "../i18n";
import { formatCurrency, formatNumber, formatDate } from "../i18n/formatters";

// Recursively collect all dot-separated keys from an object
function getAllKeys(obj: Record<string, any>, prefix = ""): string[] {
  let keys: string[] = [];
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullPath));
    } else {
      keys.push(fullPath);
    }
  }
  return keys;
}

// Extract interpolation variables like {{name}} from string
function extractPlaceholders(str: string): string[] {
  const matches = str.match(/\{\{([^}]+)\}\}/g);
  return matches ? matches.map((m) => m.replace(/[{}]/g, "").trim()).sort() : [];
}

describe("Internationalization (i18n) Architecture", () => {
  it("should have correct locale configuration and metadata", () => {
    expect(locales).toContain("en");
    expect(locales).toContain("am");
    expect(locales).toContain("om");
    expect(defaultLocale).toBe("en");

    expect(localeMetadata.en.nativeName).toBe("English");
    expect(localeMetadata.am.nativeName).toBe("አማርኛ");
    expect(localeMetadata.om.nativeName).toBe("Afaan Oromoo");
  });

  const namespaces = [
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
  ] as const;

  namespaces.forEach((ns) => {
    describe(`Namespace parity: ${ns}`, () => {
      const enNs = (resources.en as any)[ns];
      const amNs = (resources.am as any)[ns];
      const omNs = (resources.om as any)[ns];

      it(`should have valid non-empty English resources for ${ns}`, () => {
        expect(enNs).toBeDefined();
        const enKeys = getAllKeys(enNs);
        expect(enKeys.length).toBeGreaterThan(0);
      });

      it(`should have 100% key parity between English and Amharic for ${ns}`, () => {
        const enKeys = getAllKeys(enNs).sort();
        const amKeys = getAllKeys(amNs).sort();

        const missingInAm = enKeys.filter((k) => !amKeys.includes(k));
        expect(missingInAm, `Missing keys in Amharic (${ns}): ${missingInAm.join(", ")}`).toEqual([]);

        const extraInAm = amKeys.filter((k) => !enKeys.includes(k));
        expect(extraInAm, `Unexpected keys in Amharic (${ns}): ${extraInAm.join(", ")}`).toEqual([]);
      });

      it(`should have 100% key parity between English and Afaan Oromoo for ${ns}`, () => {
        const enKeys = getAllKeys(enNs).sort();
        const omKeys = getAllKeys(omNs).sort();

        const missingInOm = enKeys.filter((k) => !omKeys.includes(k));
        expect(missingInOm, `Missing keys in Afaan Oromoo (${ns}): ${missingInOm.join(", ")}`).toEqual([]);

        const extraInOm = omKeys.filter((k) => !enKeys.includes(k));
        expect(extraInOm, `Unexpected keys in Afaan Oromoo (${ns}): ${extraInOm.join(", ")}`).toEqual([]);
      });

      it(`should not have any empty string values for ${ns}`, () => {
        for (const loc of ["en", "am", "om"] as const) {
          const locNs = (resources[loc] as any)[ns];
          const keys = getAllKeys(locNs);

          keys.forEach((keyPath) => {
            const parts = keyPath.split(".");
            let val: any = locNs;
            for (const part of parts) {
              val = val[part];
            }
            expect(typeof val, `Value for ${loc}:${ns}.${keyPath} should be string`).toBe("string");
            expect(val.trim().length, `Value for ${loc}:${ns}.${keyPath} should not be empty`).toBeGreaterThan(0);
          });
        }
      });

      it(`should have matching interpolation parameters across locales for ${ns}`, () => {
        const enKeys = getAllKeys(enNs);
        enKeys.forEach((keyPath) => {
          const parts = keyPath.split(".");
          const getVal = (obj: any) => parts.reduce((acc, p) => acc?.[p], obj);

          const enVal = getVal(enNs);
          const amVal = getVal(amNs);
          const omVal = getVal(omNs);

          const enPlaceholders = extractPlaceholders(enVal);
          const amPlaceholders = extractPlaceholders(amVal);
          const omPlaceholders = extractPlaceholders(omVal);

          expect(
            amPlaceholders,
            `Amharic placeholders mismatch in ${ns}.${keyPath}: expected [${enPlaceholders}] but got [${amPlaceholders}]`
          ).toEqual(enPlaceholders);

          expect(
            omPlaceholders,
            `Afaan Oromoo placeholders mismatch in ${ns}.${keyPath}: expected [${enPlaceholders}] but got [${omPlaceholders}]`
          ).toEqual(enPlaceholders);
        });
      });
    });
  });

  describe("Locale-aware Formatters", () => {
    it("should correctly format Ethiopian Birr currency for different locales", () => {
      expect(formatCurrency(2500000, "ETB", "en")).toBe("2,500,000 ETB");
      expect(formatCurrency(2500000, "ETB", "am")).toBe("2,500,000 ብር");
      expect(formatCurrency(2500000, "ETB", "om")).toBe("2,500,000 ETB");
      expect(formatCurrency(0, "ETB", "en")).toBe("0 ETB");
      expect(formatCurrency(null, "ETB", "en")).toBe("0 ETB");
    });

    it("should format numbers with locale thousands separators", () => {
      expect(formatNumber(125000, "en")).toBe("125,000");
      expect(formatNumber(125000, "am")).toBe("125,000");
      expect(formatNumber(0, "en")).toBe("0");
    });

    it("should format dates in a locale-aware manner", () => {
      const testDate = new Date("2026-05-15T12:00:00Z");
      const enDate = formatDate(testDate, "en");
      expect(enDate).toContain("2026");

      const amDate = formatDate(testDate, "am");
      expect(amDate).toContain("2026");
    });
  });
});
