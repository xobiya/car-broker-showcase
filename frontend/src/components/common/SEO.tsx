import React, { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEO_CONFIG, getCanonicalUrl, getAbsoluteImageUrl, buildBreadcrumbSchema } from "../../lib/seo";

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "product" | "article";
  noIndex?: boolean;
  schema?: Record<string, any> | Array<Record<string, any>>;
  breadcrumbs?: Array<{ name: string; url: string }>;
}

function setOrCreateMeta(name: string, content: string, isProperty = false) {
  if (typeof document === "undefined") return;
  const attributeName = isProperty ? "property" : "name";
  let el = document.querySelector(`meta[${attributeName}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attributeName, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setOrCreateLink(rel: string, href: string, hreflang?: string) {
  if (typeof document === "undefined") return;
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    if (hreflang) el.setAttribute("hreflang", hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export default function SEO({
  title,
  description,
  keywords,
  canonical,
  image,
  type = "website",
  noIndex = false,
  schema,
  breadcrumbs
}: SEOProps) {
  const location = useLocation();
  const { i18n } = useTranslation();
  const currentLang = i18n.language || "en";

  // Compute final title
  const finalTitle = useMemo(() => {
    if (!title) return SEO_CONFIG.defaultTitle;
    if (title.includes("Arif Car Sell") || title.includes("አሪፍ ካር ሴል")) {
      return title;
    }
    return `${title} | ${SEO_CONFIG.siteName}`;
  }, [title]);

  // Compute final description
  const finalDescription = useMemo(() => {
    return description || SEO_CONFIG.defaultDescription;
  }, [description]);

  // Compute final keywords
  const finalKeywords = useMemo(() => {
    return keywords || SEO_CONFIG.defaultKeywords;
  }, [keywords]);

  // Compute canonical URL
  const canonicalUrl = useMemo(() => {
    return getCanonicalUrl(canonical || location.pathname);
  }, [canonical, location.pathname]);

  // Compute image URL
  const ogImageUrl = useMemo(() => {
    return getAbsoluteImageUrl(image);
  }, [image]);

  // Compute locale string for Open Graph
  const ogLocale = useMemo(() => {
    if (currentLang === "am") return "am_ET";
    if (currentLang === "om") return "om_ET";
    return "en_US";
  }, [currentLang]);

  // Merge structured data
  const finalSchemas = useMemo(() => {
    const list: Array<Record<string, any>> = [];
    if (breadcrumbs && breadcrumbs.length > 0) {
      list.push(buildBreadcrumbSchema(breadcrumbs));
    }
    if (schema) {
      if (Array.isArray(schema)) {
        list.push(...schema);
      } else {
        list.push(schema);
      }
    }
    return list;
  }, [schema, breadcrumbs]);

  // Synchronize DOM elements (Title, Meta, OpenGraph, Twitter, Links, JSON-LD)
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Document Title
    document.title = finalTitle;

    // Standard Meta Tags
    setOrCreateMeta("description", finalDescription);
    setOrCreateMeta("keywords", finalKeywords);
    setOrCreateMeta("robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
    setOrCreateMeta("author", SEO_CONFIG.siteName);
    setOrCreateMeta("theme-color", "#0B0F19");

    // Canonical Link
    setOrCreateLink("canonical", canonicalUrl);

    // Multi-language Alternate Links (hreflang)
    setOrCreateLink("alternate", canonicalUrl, "en");
    setOrCreateLink("alternate", canonicalUrl, "am");
    setOrCreateLink("alternate", canonicalUrl, "om");
    setOrCreateLink("alternate", canonicalUrl, "x-default");

    // Open Graph Tags
    setOrCreateMeta("og:title", finalTitle, true);
    setOrCreateMeta("og:description", finalDescription, true);
    setOrCreateMeta("og:image", ogImageUrl, true);
    setOrCreateMeta("og:url", canonicalUrl, true);
    setOrCreateMeta("og:type", type, true);
    setOrCreateMeta("og:site_name", SEO_CONFIG.siteName, true);
    setOrCreateMeta("og:locale", ogLocale, true);

    // Twitter Card Tags
    setOrCreateMeta("twitter:card", "summary_large_image");
    setOrCreateMeta("twitter:title", finalTitle);
    setOrCreateMeta("twitter:description", finalDescription);
    setOrCreateMeta("twitter:image", ogImageUrl);
    setOrCreateMeta("twitter:site", SEO_CONFIG.twitterHandle);
    setOrCreateMeta("twitter:creator", SEO_CONFIG.twitterHandle);

    // Structured Data JSON-LD Script
    let scriptTag = document.getElementById("seo-schema-jsonld") as HTMLScriptElement | null;
    if (finalSchemas.length > 0) {
      if (!scriptTag) {
        scriptTag = document.createElement("script");
        scriptTag.id = "seo-schema-jsonld";
        scriptTag.type = "application/ld+json";
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(
        finalSchemas.length === 1 ? finalSchemas[0] : finalSchemas
      );
    } else if (scriptTag) {
      scriptTag.remove();
    }
  }, [
    finalTitle,
    finalDescription,
    finalKeywords,
    canonicalUrl,
    ogImageUrl,
    type,
    noIndex,
    ogLocale,
    finalSchemas
  ]);

  return (
    <>
      {/* React 19 native head element declarations */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large"} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={ogImageUrl} />
      {finalSchemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              finalSchemas.length === 1 ? finalSchemas[0] : finalSchemas
            )
          }}
        />
      )}
    </>
  );
}
