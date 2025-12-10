import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

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
      source: "frontend"
    };

    const BACKEND_URL = getBackendUrl();
    const apiUrl = `${BACKEND_URL}/api/products/save-from-frontend`;
    
    console.log(`[Save Product API] Calling backend: ${apiUrl}`);
    console.log(`[Save Product API] BACKEND_URL: ${BACKEND_URL}`);
    console.log(`[Save Product API] Product data:`, JSON.stringify(productData, null, 2));
    
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productData),
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Save Product API] Backend error: ${response.status}`, errorText);
      console.error(`[Save Product API] Backend URL used: ${apiUrl}`);
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
