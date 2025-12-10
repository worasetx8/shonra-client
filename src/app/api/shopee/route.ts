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
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: true, message: error.message || "Failed to fetch products" }, { status: 500 });
  }
}
