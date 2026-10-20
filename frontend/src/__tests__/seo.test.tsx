import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import fs from "fs";
import path from "path";
import "../i18n";
import SEO from "../components/common/SEO";
import {
  SEO_CONFIG,
  getCanonicalUrl,
  getAbsoluteImageUrl,
  buildAutoDealerSchema,
  buildWebSiteSchema,
  buildVehicleSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildServicesSchema,
} from "../lib/seo";

describe("Professional SEO Architecture & Schema.org Structured Data", () => {
  beforeEach(() => {
    // Clear head elements created during tests
    document.title = "";
    document.querySelectorAll("meta").forEach((el) => el.remove());
    document.querySelectorAll('link[rel="canonical"], link[rel="alternate"]').forEach((el) => el.remove());
    document.getElementById("seo-schema-jsonld")?.remove();
  });

  describe("URL & Asset Helpers", () => {
    it("should generate canonical URLs properly", () => {
      expect(getCanonicalUrl("/")).toBe("https://arifcarsell.com");
      expect(getCanonicalUrl("/showroom")).toBe("https://arifcarsell.com/showroom");
      expect(getCanonicalUrl("services")).toBe("https://arifcarsell.com/services");
    });

    it("should resolve absolute Open Graph and Twitter image URLs", () => {
      expect(getAbsoluteImageUrl()).toBe(SEO_CONFIG.defaultOgImage);
      expect(getAbsoluteImageUrl("https://custom.com/car.jpg")).toBe("https://custom.com/car.jpg");
      expect(getAbsoluteImageUrl("/images/car.png")).toBe("https://arifcarsell.com/images/car.png");
    });
  });

  describe("Schema.org Generators (Google Rich Results Compliance)", () => {
    it("should generate valid AutoDealer & LocalBusiness schema", () => {
      const schema = buildAutoDealerSchema();
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toContain("AutoDealer");
      expect(schema["@type"]).toContain("LocalBusiness");
      expect(schema.name).toBe("Arif Car Sell");
      expect(schema.currenciesAccepted).toBe("ETB");
      expect(schema.address.addressLocality).toBe("Addis Ababa");
      expect(schema.address.addressCountry).toBe("ET");
      expect(schema.telephone).toBeTruthy();
    });

    it("should generate valid WebSite schema with Sitelinks Searchbox", () => {
      const schema = buildWebSiteSchema();
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("WebSite");
      expect(schema.name).toBe("Arif Car Sell");
      expect(schema.potentialAction["@type"]).toBe("SearchAction");
      expect(schema.potentialAction.target.urlTemplate).toContain("/showroom?search={search_term_string}");
    });

    it("should generate valid Car / Vehicle / Product schema with offers", () => {
      const mockVehicle: any = {
        id: "veh-101",
        brand: "Toyota",
        model: "Land Cruiser Prado",
        year: 2024,
        price: 14500000,
        mileage: 12000,
        transmission: "Automatic",
        fuelType: "Diesel",
        bodyType: "SUV",
        location: "Addis Ababa",
        imageUrl: "https://images.unsplash.com/photo-car.jpg",
        status: "approved",
      };

      const schema = buildVehicleSchema(mockVehicle);
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toContain("Car");
      expect(schema["@type"]).toContain("Product");
      expect(schema.name).toBe("2024 Toyota Land Cruiser Prado");
      expect(schema.brand.name).toBe("Toyota");
      expect(schema.model).toBe("Land Cruiser Prado");
      expect(schema.productionDate).toBe("2024");
      expect(schema.vehicleTransmission).toBe("Automatic");
      expect(schema.fuelType).toBe("Diesel");
      expect(schema.mileageFromOdometer.value).toBe(12000);
      expect(schema.offers["@type"]).toBe("Offer");
      expect(schema.offers.price).toBe(14500000);
      expect(schema.offers.priceCurrency).toBe("ETB");
      expect(schema.offers.availability).toBe("https://schema.org/InStock");
    });

    it("should generate valid BreadcrumbList schema", () => {
      const crumbs = [
        { name: "Home", url: "/" },
        { name: "Showroom", url: "/showroom" },
        { name: "Toyota Land Cruiser", url: "/vehicle/veh-101" },
      ];
      const schema = buildBreadcrumbSchema(crumbs);
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("BreadcrumbList");
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].name).toBe("Home");
      expect(schema.itemListElement[2].name).toBe("Toyota Land Cruiser");
    });

    it("should generate valid FAQPage schema for Google FAQ rich results", () => {
      const faqs = [
        { q: "How is Libre verified?", a: "Physically audited with Addis Ababa Transport Bureau." },
        { q: "What is broker commission?", a: "Strictly capped at 1.5%." },
      ];
      const schema = buildFaqSchema(faqs);
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("FAQPage");
      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[0]["@type"]).toBe("Question");
      expect(schema.mainEntity[0].name).toBe("How is Libre verified?");
      expect(schema.mainEntity[0].acceptedAnswer.text).toBe("Physically audited with Addis Ababa Transport Bureau.");
    });

    it("should generate valid Services schema", () => {
      const schema = buildServicesSchema();
      expect(schema["@context"]).toBe("https://schema.org");
      expect(schema["@type"]).toBe("Service");
      expect(schema.hasOfferCatalog.itemListElement.length).toBeGreaterThan(0);
    });
  });

  describe("SEO React Component & DOM Synchronization", () => {
    it("should dynamically synchronize document title and meta tags", () => {
      render(
        <MemoryRouter initialEntries={["/showroom"]}>
          <SEO
            title="Browse Verified Cars"
            description="Explore 100+ inspected cars for sale in Addis Ababa."
            keywords="cars Ethiopia, buy Toyota Addis Ababa"
            canonical="/showroom"
          />
        </MemoryRouter>
      );

      expect(document.title).toBe("Browse Verified Cars | Arif Car Sell");

      const descMeta = document.querySelector('meta[name="description"]')?.getAttribute("content");
      expect(descMeta).toBe("Explore 100+ inspected cars for sale in Addis Ababa.");

      const keywordsMeta = document.querySelector('meta[name="keywords"]')?.getAttribute("content");
      expect(keywordsMeta).toBe("cars Ethiopia, buy Toyota Addis Ababa");

      const robotsMeta = document.querySelector('meta[name="robots"]')?.getAttribute("content");
      expect(robotsMeta).toContain("index, follow");

      const canonicalLink = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
      expect(canonicalLink).toBe("https://arifcarsell.com/showroom");

      // Verify Open Graph & Twitter meta tags
      expect(document.querySelector('meta[property="og:title"]')?.getAttribute("content")).toBe("Browse Verified Cars | Arif Car Sell");
      expect(document.querySelector('meta[property="og:description"]')?.getAttribute("content")).toBe("Explore 100+ inspected cars for sale in Addis Ababa.");
      expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute("content")).toBe("summary_large_image");
    });

    it("should set noindex, nofollow when noIndex is true", () => {
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <SEO title="Sign In — Arif Car Sell Account" noIndex={true} />
        </MemoryRouter>
      );

      const robotsMeta = document.querySelector('meta[name="robots"]')?.getAttribute("content");
      expect(robotsMeta).toBe("noindex, nofollow");
    });

    it("should inject Schema.org JSON-LD structured data script into document head", () => {
      const faqSchema = buildFaqSchema([{ q: "Is inspection certified?", a: "Yes, 150-point diagnostic check." }]);

      render(
        <MemoryRouter initialEntries={["/help"]}>
          <SEO title="Help & Support" schema={faqSchema} />
        </MemoryRouter>
      );

      const scriptEl = document.getElementById("seo-schema-jsonld");
      expect(scriptEl).not.toBeNull();
      const parsed = JSON.parse(scriptEl!.textContent || "{}");
      expect(parsed["@type"]).toBe("FAQPage");
      expect(parsed.mainEntity[0].name).toBe("Is inspection certified?");
    });

    it("should automatically build and attach BreadcrumbList when breadcrumbs are provided", () => {
      render(
        <MemoryRouter initialEntries={["/services"]}>
          <SEO
            title="Inspection Services"
            breadcrumbs={[
              { name: "Home", url: "/" },
              { name: "Services", url: "/services" },
            ]}
          />
        </MemoryRouter>
      );

      const scriptEl = document.getElementById("seo-schema-jsonld");
      expect(scriptEl).not.toBeNull();
      const parsed = JSON.parse(scriptEl!.textContent || "{}");
      expect(parsed["@type"]).toBe("BreadcrumbList");
      expect(parsed.itemListElement[1].name).toBe("Services");
    });
  });

  describe("Public Search Engine Files (robots.txt, sitemap.xml, site.webmanifest)", () => {
    it("should have a valid public robots.txt file with sitemap pointer", () => {
      const robotsPath = path.resolve(__dirname, "../../public/robots.txt");
      expect(fs.existsSync(robotsPath)).toBe(true);

      const content = fs.readFileSync(robotsPath, "utf-8");
      expect(content).toContain("User-agent: *");
      expect(content).toContain("Allow: /showroom");
      expect(content).toContain("Disallow: /admin");
      expect(content).toContain("Disallow: /broker-dashboard");
      expect(content).toContain("Sitemap: https://arifcarsell.com/sitemap.xml");
    });

    it("should have a valid public sitemap.xml file with XML urlset and hreflang", () => {
      const sitemapPath = path.resolve(__dirname, "../../public/sitemap.xml");
      expect(fs.existsSync(sitemapPath)).toBe(true);

      const content = fs.readFileSync(sitemapPath, "utf-8");
      expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(content).toContain("<urlset");
      expect(content).toContain("<loc>https://arifcarsell.com/</loc>");
      expect(content).toContain("<loc>https://arifcarsell.com/showroom</loc>");
      expect(content).toContain("<loc>https://arifcarsell.com/services</loc>");
      expect(content).toContain('hreflang="am"');
      expect(content).toContain('hreflang="om"');
      expect(content).toContain('hreflang="en"');
    });

    it("should have a valid public site.webmanifest file", () => {
      const manifestPath = path.resolve(__dirname, "../../public/site.webmanifest");
      expect(fs.existsSync(manifestPath)).toBe(true);

      const content = fs.readFileSync(manifestPath, "utf-8");
      const json = JSON.parse(content);
      expect(json.name).toContain("Arif Car Sell");
      expect(json.start_url).toBe("/");
      expect(json.display).toBe("standalone");
      expect(json.theme_color).toBe("#0B0F19");
    });
  });
});
