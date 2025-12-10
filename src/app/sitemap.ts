import { MetadataRoute } from "next";
import { getBackendUrl } from "@/lib/api-utils";

/**
 * Generate sitemap dynamically from API settings
 * Falls back to default if API is unavailable
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shonra.com";

  try {
    const BACKEND_URL = getBackendUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      next: { revalidate: 300, tags: ["settings"] }, // Cache for 5 minutes
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.site_url) {
        siteUrl = data.data.site_url;
      }
    }
  } catch (error) {
    console.warn(
      "Failed to fetch site URL from API, using default:",
      error instanceof Error ? error.message : "Unknown error"
    );
  }

  // Static pages
  const routes = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0
    }
  ];

  return routes;
}
