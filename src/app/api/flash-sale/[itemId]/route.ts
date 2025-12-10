import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

// POST & PUT: Toggle Flash Sale status (support both methods)
export async function POST(request: NextRequest, { params }: { params: { itemId: string } }) {
  return handleFlashSaleToggle(request, { params });
}

export async function PUT(request: NextRequest, { params }: { params: { itemId: string } }) {
  return handleFlashSaleToggle(request, { params });
}

async function handleFlashSaleToggle(request: NextRequest, { params }: { params: { itemId: string } }) {
  try {
    const { itemId } = params;
    const body = await request.json();
    const { isFlashSale } = body;

    if (typeof isFlashSale !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "isFlashSale must be a boolean value"
        },
        { status: 400 }
      );
    }

    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/products/${itemId}/flash-sale`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ isFlashSale })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend responded with ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Flash Sale toggle error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to toggle Flash Sale status",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
