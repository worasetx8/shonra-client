import { MetadataRoute } from "next";
import { getBackendUrl } from "@/lib/api-utils";

/**
 * Generate sitemap dynamically from API settings
 * Includes homepage, products, and categories
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://shonra.com";
  const BACKEND_URL = getBackendUrl();

  // Fetch site URL from settings
  try {
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      next: { revalidate: 300, tags: ["settings"] }, // Cache for 5 minutes
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data?.site_url) {
        siteUrl = data.data.site_url;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch site URL from API, using default:", error);
  }

  // Static pages
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0
    }
  ];

  // Fetch products
  try {
    const productsResponse = await fetch(`${BACKEND_URL}/api/products/public`, {
      next: { revalidate: 3600, tags: ["products"] }, // Cache for 1 hour
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.success && Array.isArray(productsData.data)) {
        productsData.data.forEach((product: any) => {
          if (product.slug) {
            routes.push({
              url: `${siteUrl}/product/${product.slug}`,
              lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.8
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn("Failed to fetch products for sitemap:", error);
  }

  // Fetch categories
  try {
    const categoriesResponse = await fetch(`${BACKEND_URL}/api/categories`, {
      next: { revalidate: 3600, tags: ["categories"] }, // Cache for 1 hour
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success && Array.isArray(categoriesData.data)) {
        categoriesData.data.forEach((category: any) => {
          if (category.slug) {
            routes.push({
              url: `${siteUrl}/category/${category.slug}`,
              lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
              changeFrequency: "weekly" as const,
              priority: 0.7
            });
          }
        });
      }
    }
  } catch (error) {
    console.warn("Failed to fetch categories for sitemap:", error);
  }

  return routes;
}
