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
    
    let response: Response;
    let errorText: string = '';
    
    try {
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(productData),
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(30000), // 30 seconds timeout
      });

      if (!response.ok) {
        errorText = await response.text();
        console.error(`[Save Product API] Backend error: ${response.status}`, errorText.substring(0, 500));
        console.error(`[Save Product API] Backend URL used: ${apiUrl}`);
        
        // If 502 Bad Gateway, try fallback to public URL
        if (response.status === 502 && BACKEND_URL.includes('backend-api')) {
          console.log(`[Save Product API] 502 error detected, trying fallback to public URL...`);
          const fallbackUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.shonra.com";
          const fallbackApiUrl = `${fallbackUrl}/api/products/save-from-frontend`;
          
          try {
            response = await fetch(fallbackApiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(productData),
              signal: AbortSignal.timeout(30000),
            });
            
            if (!response.ok) {
              errorText = await response.text();
              throw new Error(`Backend responded with ${response.status}: ${errorText.substring(0, 200)}`);
            }
            console.log(`[Save Product API] Fallback successful`);
          } catch (fallbackError: any) {
            console.error(`[Save Product API] Fallback also failed:`, fallbackError.message);
            throw new Error(`Backend unavailable (502). Tried both internal and public URLs.`);
          }
        } else {
          throw new Error(`Backend responded with ${response.status}: ${errorText.substring(0, 200)}`);
        }
      }
    } catch (error: any) {
      // Handle network errors, timeouts, etc.
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        throw new Error('Request timeout. Backend service may be unavailable.');
      }
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        // Try fallback to public URL
        const fallbackUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.shonra.com";
        const fallbackApiUrl = `${fallbackUrl}/api/products/save-from-frontend`;
        
        console.log(`[Save Product API] Network error, trying fallback to public URL: ${fallbackApiUrl}`);
        
        try {
          response = await fetch(fallbackApiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(productData),
            signal: AbortSignal.timeout(30000),
          });
          
          if (!response.ok) {
            errorText = await response.text();
            throw new Error(`Backend responded with ${response.status}: ${errorText.substring(0, 200)}`);
          }
          console.log(`[Save Product API] Fallback successful`);
        } catch (fallbackError: any) {
          console.error(`[Save Product API] Fallback also failed:`, fallbackError.message);
          throw new Error(`Cannot connect to backend service. Please check backend URL configuration.`);
        }
      } else {
        throw error;
      }
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
