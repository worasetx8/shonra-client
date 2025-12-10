import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

/**
 * Save product from frontend (public endpoint, no auth required)
 * This endpoint is used when users click "Shop Now" on Shopee products
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Add source = 'frontend' to indicate product was added from client page
    const productData = {
      ...body,
      source: 'frontend'
    };

    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/products/save-from-frontend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend responded with ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Save product from frontend error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save product",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

