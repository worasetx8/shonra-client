import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const productData = await request.json();

    const BACKEND_URL = getBackendUrl();
    const apiUrl = `${BACKEND_URL}/api/products/check`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Check Product API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to check product"
      },
      { status: 500 }
    );
  }
}
