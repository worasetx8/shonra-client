import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export async function GET(request: Request, { params }: { params: { itemId: string } }) {
  try {
    const { itemId } = params;

    const BACKEND_URL = getBackendUrl();
    const apiUrl = `${BACKEND_URL}/api/products/item/${itemId}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      let errorMessage = `Backend returned ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If response is not JSON, use the default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Get Product by Item ID API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch product"
      },
      { status: 500 }
    );
  }
}
