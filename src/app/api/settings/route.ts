import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check if this is a hard refresh (F5) - browser sends Cache-Control: no-cache or Pragma: no-cache
    const cacheControl = request.headers.get('cache-control');
    const pragma = request.headers.get('pragma');
    const isHardRefresh = cacheControl?.includes('no-cache') || pragma === 'no-cache';

    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      headers: {
        "Content-Type": "application/json",
      },
      // If hard refresh, bypass cache. Otherwise, use Next.js Data Cache for 1 minute
      ...(isHardRefresh ? { cache: 'no-store' } : {
        next: { 
          revalidate: 60, // Revalidate every 1 minute
          tags: ['settings'] // Tag for manual revalidation
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Cache-Control: Use stale-while-revalidate pattern for normal requests
    // For hard refresh, set no-cache to prevent browser caching
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': isHardRefresh 
          ? 'no-cache, no-store, must-revalidate' 
          : 'public, s-maxage=60, stale-while-revalidate=120',
      }
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
