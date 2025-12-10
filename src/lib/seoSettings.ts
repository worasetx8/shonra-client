/**
 * SEO Settings Utility
 * Fetches SEO settings from API with fallback to environment variables
 */

interface SEOSettings {
  siteUrl: string;
  sitemapUrl: string;
  metaDescription: string;
  metaKeywords: string[];
  metaTitleTemplate: string;
  ogImage: string;
  ogTitle?: string;
  ogDescription?: string;
  twitterHandle: string;
  googleVerification?: string;
  bingVerification?: string;
  enableAISEO: boolean;
  aiSEOLanguage: "th" | "en";
  canonicalUrl: string;
  robotsMeta: string;
}

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://shonra.com";
const DEFAULT_SITE_NAME = "SHONRA";
const DEFAULT_DESCRIPTION =
  "All amazing deals and earn commissions with SHONRA. Find the best products from Shopee with exclusive discounts and flash sales.";
const DEFAULT_KEYWORDS = [
  "Shopee",
  "Affiliate",
  "E-commerce",
  "Flash Sale",
  "Deals",
  "Discount",
  "Thailand",
  "สินค้า",
  "โปรโมชั่น",
  "ลดราคา"
];

let cachedSettings: SEOSettings | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

/**
 * Fetch SEO settings from API with caching
 */
export async function getSEOSettings(): Promise<SEOSettings> {
  // Return cached settings if still valid
  const now = Date.now();
  if (cachedSettings && now - cacheTimestamp < CACHE_DURATION) {
    return cachedSettings;
  }

  try {
    const response = await fetch("/api/settings", {
      next: { revalidate: 60, tags: ["settings"] } // Cache for 60 seconds
    });

    if (response.ok) {
      const data = await response.json();

      if (data.success && data.data) {
        const settings = data.data;

        // Build SEO settings with fallbacks
        const seoSettings: SEOSettings = {
          siteUrl: settings.site_url || DEFAULT_SITE_URL,
          sitemapUrl: settings.sitemap_url || `${DEFAULT_SITE_URL}/sitemap.xml`,
          metaDescription: settings.meta_description || DEFAULT_DESCRIPTION,
          metaKeywords: settings.meta_keywords
            ? settings.meta_keywords
                .split(",")
                .map((k: string) => k.trim())
                .filter((k: string) => k.length > 0)
            : DEFAULT_KEYWORDS,
          metaTitleTemplate: settings.meta_title_template || `%s | ${DEFAULT_SITE_NAME}`,
          ogImage: settings.og_image_url || `${DEFAULT_SITE_URL}/og-image.jpg`,
          ogTitle: settings.og_title || undefined,
          ogDescription: settings.og_description || undefined,
          twitterHandle: settings.twitter_handle || "@shonra",
          googleVerification: settings.google_verification_code || undefined,
          bingVerification: settings.bing_verification_code || undefined,
          enableAISEO: settings.enable_ai_seo || false,
          aiSEOLanguage: (settings.ai_seo_language === "en" ? "en" : "th") as "th" | "en",
          canonicalUrl: settings.canonical_url || settings.site_url || DEFAULT_SITE_URL,
          robotsMeta: settings.robots_meta || "index, follow"
        };

        // Cache the settings
        cachedSettings = seoSettings;
        cacheTimestamp = now;

        return seoSettings;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch SEO settings from API, using defaults:", error);
  }

  // Fallback to defaults
  const fallbackSettings: SEOSettings = {
    siteUrl: DEFAULT_SITE_URL,
    sitemapUrl: `${DEFAULT_SITE_URL}/sitemap.xml`,
    metaDescription: DEFAULT_DESCRIPTION,
    metaKeywords: DEFAULT_KEYWORDS,
    metaTitleTemplate: `%s | ${DEFAULT_SITE_NAME}`,
    ogImage: `${DEFAULT_SITE_URL}/og-image.jpg`,
    twitterHandle: "@shonra",
    enableAISEO: false,
    aiSEOLanguage: "th",
    canonicalUrl: DEFAULT_SITE_URL,
    robotsMeta: "index, follow"
  };

  return fallbackSettings;
}

/**
 * Clear SEO settings cache
 */
export function clearSEOSettingsCache() {
  cachedSettings = null;
  cacheTimestamp = 0;
}
