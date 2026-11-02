import { describe, it, expect } from "vitest";
import { formatPrice } from "../../../mobile/src/utils/currency";
import fs from "fs";
import path from "path";

describe("Mobile Application i18n & Localization", () => {
  const langFilePath = path.resolve(__dirname, "../../../mobile/src/i18n/LanguageContext.tsx");
  const content = fs.readFileSync(langFilePath, "utf8");

  // Extract translations dictionary
  const startIndex = content.indexOf("const translations: Record<Locale, Record<string, string>> = {");
  const endIndex = content.indexOf("interface LanguageContextType", startIndex);
  const dictText = content.slice(startIndex, endIndex);

  const fn = new Function(`
    const translations = ${dictText.replace("const translations: Record<Locale, Record<string, string>> = ", "").replace(/;\s*$/, "")};
    return translations;
  `);
  const translations = fn();

  it("should have matching key parity between EN, AM, and OM in mobile", () => {
    const enKeys = Object.keys(translations.en).sort();
    const amKeys = Object.keys(translations.am).sort();
    const omKeys = Object.keys(translations.om).sort();

    expect(enKeys.length).toBeGreaterThan(50);
    expect(amKeys).toEqual(enKeys);
    expect(omKeys).toEqual(enKeys);
  });

  it("should not contain empty translation values in any mobile locale", () => {
    for (const loc of ["en", "am", "om"]) {
      for (const [key, val] of Object.entries(translations[loc])) {
        expect(typeof val, `Value for ${loc}:${key} should be string`).toBe("string");
        expect((val as string).trim().length, `Value for ${loc}:${key} should not be empty`).toBeGreaterThan(0);
      }
    }
  });

  it("should format currency with locale awareness (ETB vs ብር)", () => {
    expect(formatPrice(1500000)).toBe("ETB 1,500,000");
    expect(formatPrice(1500000, "en")).toBe("ETB 1,500,000");
    expect(formatPrice(1500000, "am")).toBe("1,500,000 ብር");
    expect(formatPrice(1500000, "om")).toBe("ETB 1,500,000");
  });
});
