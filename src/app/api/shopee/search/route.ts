import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const search = searchParams.get("search") || "";
    const commissionRate = searchParams.get("commissionRate") || "0";
    const ratingStar = searchParams.get("ratingStar") || "0";

    const params = new URLSearchParams({
      page,
      search
    });

    // Only add commission rate and rating star if they are greater than 0
    if (parseFloat(commissionRate) > 0) {
      params.append("commissionRate", commissionRate);
    }
    if (parseFloat(ratingStar) > 0) {
      params.append("ratingStar", ratingStar);
    }

    const BACKEND_URL = getBackendUrl();
    const apiUrl = `${BACKEND_URL}/api/products/search?${params}`;
    
    console.log(`[API Route] Calling backend: ${apiUrl}`);
    console.log(`[API Route] BACKEND_URL from env: ${process.env.BACKEND_URL || 'not set'}`);
    console.log(`[API Route] NEXT_PUBLIC_BACKEND_URL from env: ${process.env.NEXT_PUBLIC_BACKEND_URL || 'not set'}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[API Route] Backend API error: ${response.status}`, errorText);
      console.error(`[API Route] Backend URL used: ${apiUrl}`);
      return NextResponse.json(
        { 
          success: false,
          error: true, 
          message: `Backend returned ${response.status}: ${errorText.substring(0, 200)}`,
          backendUrl: BACKEND_URL,
          apiUrl: apiUrl
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[API Route] API Error in /api/shopee/search:", error);
    console.error("[API Route] Error details:", {
      message: error.message,
      name: error.name,
      cause: error.cause,
      BACKEND_URL: process.env.BACKEND_URL,
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL
    });
    
    // Check if it's a timeout error
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return NextResponse.json(
        { 
          success: false,
          error: true, 
          message: "Request timeout. Backend service may be unavailable."
        }, 
        { status: 504 }
      );
    }
    
    // Check if it's a network error
    if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          success: false,
          error: true, 
          message: "Cannot connect to backend service. Please check backend URL configuration.",
          backendUrl: getBackendUrl()
        }, 
        { status: 502 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: true, 
        message: error.message || "Failed to search Shopee products",
        backendUrl: getBackendUrl()
      }, 
      { status: 500 }
    );
  }
}

