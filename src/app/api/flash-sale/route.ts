import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, createDefaultHeaders } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

// GET: Fetch Flash Sale products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    const BACKEND_URL = getBackendUrl();
    const url = `${BACKEND_URL}/api/products/flash-sale?page=${page}&limit=${limit}`;

    const response = await fetch(url, {
      method: "GET",
      headers: createDefaultHeaders(),
      cache: "no-store" // Ensure fresh data
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Flash Sale API] Backend error: ${response.status} - ${errorText}`);
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Flash Sale API] Fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch Flash Sale products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
