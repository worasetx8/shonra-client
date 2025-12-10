import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

// GET: Fetch active products (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "50";
    const categoryId = searchParams.get("category_id") || "all";
    const tagId = searchParams.get("tag_id") || "all";
    const search = searchParams.get("search") || "";

    const params: Record<string, string> = {
      page,
      limit,
      category_id: categoryId,
      tag_id: tagId
    };

    if (search) {
      params.search = search;
    }

    const BACKEND_URL = getBackendUrl();
    const url = `${BACKEND_URL}/api/products/public?${new URLSearchParams(params)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Backend responded with ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Public products fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

