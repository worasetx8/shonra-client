import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // Forward the sync request to the backend
    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/sync-products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Backend sync failed with status ${response.status}`);
    }

    const syncResult = await response.json();
    return NextResponse.json(syncResult);
  } catch (error: any) {
    console.error("❌ Sync API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to sync products"
      },
      { status: 500 }
    );
  }
}
// GET method to check sync status or get sync history
export async function GET() {
  return NextResponse.json({
    message: "Product sync endpoint ready",
    availableMethods: ["POST"],
    description: "Use POST to start product synchronization with Shopee API"
  });
}
