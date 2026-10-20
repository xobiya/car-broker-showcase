import type { VehicleListing } from "../../../shared/types";

export const SEO_CONFIG = {
  siteName: "Arif Car Sell",
  siteUrl: "https://arifcarsell.com",
  defaultTitle: "Arif Car Sell — Ethiopia's Trusted Auto Marketplace & Vehicle Procurement",
  titleTemplate: "%s | Arif Car Sell",
  defaultDescription:
    "Buy and sell verified cars in Addis Ababa and across Ethiopia with 150-point mechanic inspections, title deed (libre) verification, and 1.5% fixed commission.",
  defaultKeywords:
    "cars for sale Ethiopia, buy car Addis Ababa, Toyota Land Cruiser Ethiopia, BYD electric vehicles Addis Ababa, car broker Ethiopia, verified used cars Addis Ababa, Suzuki Swift Ethiopia, Ethiopian auto marketplace, libre verification Addis Ababa",
  defaultOgImage: "https://arifcarsell.com/images/about/customer_handover.jpg",
  twitterHandle: "@arifcarsell",
  contact: {
    phone: "+251 91 123 4567",
    email: "contact@arifcarsell.et",
    streetAddress: "Bole Medhanialem, Edna Mall Area, Next to Harmony Hotel",
    addressLocality: "Addis Ababa",
    addressRegion: "Addis Ababa",
    postalCode: "1000",
    addressCountry: "ET",
    latitude: 9.0016,
    longitude: 38.7845,
    openingHours: "Mo-Sa 08:30-18:30"
  }
};

/**
 * Returns a clean, absolute canonical URL for a given path using the authoritative site domain.
 */
export function getCanonicalUrl(path = "/", baseUrl = SEO_CONFIG.siteUrl): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath === "/" ? "" : cleanPath}`;
}

/**
 * Resolves an image URL to an absolute URL suitable for Open Graph / Twitter previews.
 */
export function getAbsoluteImageUrl(imagePath?: string, baseUrl = SEO_CONFIG.siteUrl): string {
  if (!imagePath) return SEO_CONFIG.defaultOgImage;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Builds Schema.org AutoDealer / LocalBusiness structured data.
 */
export function buildAutoDealerSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["AutoDealer", "LocalBusiness"],
    "@id": `${SEO_CONFIG.siteUrl}/#organization`,
    name: SEO_CONFIG.siteName,
    legalName: "Arif Auto Brokerage & Vehicle Procurement Platform",
    url: SEO_CONFIG.siteUrl,
    logo: `${SEO_CONFIG.siteUrl}/logo.png`,
    image: SEO_CONFIG.defaultOgImage,
    description: SEO_CONFIG.defaultDescription,
    telephone: SEO_CONFIG.contact.phone,
    email: SEO_CONFIG.contact.email,
    priceRange: "ETB 500,000 - ETB 35,000,000",
    currenciesAccepted: "ETB",
    paymentAccepted: "Bank Transfer, Escrow, Certified Cheque",
    address: {
      "@type": "PostalAddress",
      streetAddress: SEO_CONFIG.contact.streetAddress,
      addressLocality: SEO_CONFIG.contact.addressLocality,
      addressRegion: SEO_CONFIG.contact.addressRegion,
      postalCode: SEO_CONFIG.contact.postalCode,
      addressCountry: SEO_CONFIG.contact.addressCountry
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SEO_CONFIG.contact.latitude,
      longitude: SEO_CONFIG.contact.longitude
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:30",
        closes: "18:30"
      }
    ],
    areaServed: {
      "@type": "Country",
      name: "Ethiopia"
    },
    sameAs: [
      "https://t.me/arifcarsell",
      "https://facebook.com/arifcarsell",
      "https://twitter.com/arifcarsell",
      "https://instagram.com/arifcarsell"
    ]
  };
}

/**
 * Builds Schema.org WebSite structured data with Sitelinks Searchbox.
 */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SEO_CONFIG.siteUrl}/#website`,
    url: SEO_CONFIG.siteUrl,
    name: SEO_CONFIG.siteName,
    description: SEO_CONFIG.defaultDescription,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SEO_CONFIG.siteUrl}/showroom?search={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    },
    inLanguage: ["en-US", "am-ET", "om-ET"]
  };
}

/**
 * Builds Schema.org Car / Vehicle / Product structured data for an individual vehicle listing.
 */
export function buildVehicleSchema(vehicle: VehicleListing, siteUrl = SEO_CONFIG.siteUrl) {
  const vehicleUrl = `${siteUrl}/vehicle/${vehicle.id}`;
  const condition = (vehicle.condition || "").toLowerCase().includes("new")
    ? "https://schema.org/NewCondition"
    : "https://schema.org/UsedCondition";

  return {
    "@context": "https://schema.org",
    "@type": ["Car", "Vehicle", "Product"],
    "@id": vehicleUrl,
    name: `${vehicle.year} ${vehicle.brand} ${vehicle.model}`,
    description: vehicle.description || `${vehicle.year} ${vehicle.brand} ${vehicle.model} available for sale in ${vehicle.location || "Addis Ababa"}. Verified title deed (libre), 150-point mechanic inspection, transparent 1.5% broker fee.`,
    image: [getAbsoluteImageUrl(vehicle.imageUrl)],
    url: vehicleUrl,
    brand: {
      "@type": "Brand",
      name: vehicle.brand
    },
    model: vehicle.model,
    modelDate: String(vehicle.year),
    productionDate: String(vehicle.year),
    vehicleTransmission: vehicle.transmission || "Automatic",
    fuelType: vehicle.fuelType || "Petrol",
    bodyType: vehicle.bodyType || "Sedan",
    itemCondition: condition,
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage || 0,
      unitCode: "KMT"
    },
    offers: {
      "@type": "Offer",
      url: vehicleUrl,
      price: vehicle.price,
      priceCurrency: "ETB",
      priceValidUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability: vehicle.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      itemCondition: condition,
      seller: {
        "@type": "AutoDealer",
        name: SEO_CONFIG.siteName,
        telephone: SEO_CONFIG.contact.phone,
        url: SEO_CONFIG.siteUrl
      }
    }
  };
}

/**
 * Builds Schema.org BreadcrumbList structured data.
 */
export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : getCanonicalUrl(item.url)
    }))
  };
}

/**
 * Builds Schema.org FAQPage structured data for Google FAQ Rich Results.
 */
export function buildFaqSchema(faqs: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  };
}

/**
 * Builds Schema.org Service structured data for automotive services.
 */
export function buildServicesSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Automotive Marketplace & Escrow Brokerage",
    provider: {
      "@type": "AutoDealer",
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.siteUrl
    },
    areaServed: {
      "@type": "City",
      name: "Addis Ababa"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Vehicle Brokerage & Verification Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "150-Point Physical Vehicle Inspection",
            description: "Computerized OBD-II engine diagnosis, frame alignment, paint-depth analysis, and EV/hybrid high-voltage battery health test."
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Title Deed (Libre) & Customs Clearance Audit",
            description: "Direct verification with Addis Ababa Transport Bureau to authenticate libre ownership, liens, and customs clearance."
          }
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Escrow-Protected Vehicle Brokerage",
            description: "Capped 1.5% broker commission with secure bank escrow transaction facilitation and standardized legal transfer contracts."
          }
        }
      ]
    }
  };
}
