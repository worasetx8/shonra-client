import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

// GET: Fetch all products with Flash Sale status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const search = searchParams.get("search") || "";

    const BACKEND_URL = getBackendUrl();
    const url = new URL(`${BACKEND_URL}/api/products/with-flash-sale`);
    url.searchParams.set("page", page);
    url.searchParams.set("limit", limit);
    if (search) {
      url.searchParams.set("search", search);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store" // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Products with Flash Sale status fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products with Flash Sale status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
