import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, createDefaultHeaders } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

// GET: Fetch all active tags
export async function GET(request: NextRequest) {
  try {
    // Check if this is a hard refresh (F5) - browser sends Cache-Control: no-cache or Pragma: no-cache
    const cacheControl = request.headers.get("cache-control");
    const pragma = request.headers.get("pragma");
    const isHardRefresh = cacheControl?.includes("no-cache") || pragma === "no-cache";

    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/tags/public`, {
      method: "GET",
      headers: createDefaultHeaders(),
      // If hard refresh, bypass cache. Otherwise, use Next.js Data Cache for 5 minutes
      ...(isHardRefresh
        ? { cache: "no-store" }
        : {
            next: {
              revalidate: 300, // Revalidate every 5 minutes
              tags: ["tags"] // Tag for manual revalidation
            }
          })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();

    // Cache-Control: Use stale-while-revalidate pattern for normal requests
    // For hard refresh, set no-cache to prevent browser caching
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": isHardRefresh
          ? "no-cache, no-store, must-revalidate"
          : "public, s-maxage=300, stale-while-revalidate=600"
      }
    });
  } catch (error) {
    console.error("Tags fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch tags",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
