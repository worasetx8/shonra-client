import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getAuthToken, createAuthHeaders, validateAuth } from "@/lib/api-utils";

// PUT - เปลี่ยนสถานะแอดมิน
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const token = getAuthToken(request);

    if (!validateAuth(token)) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการยืนยันตัวตน" }, { status: 401 });
    }

    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/admin/users/${params.id}/status`, {
      method: "PUT",
      headers: createAuthHeaders(token!),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || "Failed to update admin status");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error updating admin status:", error);
    return NextResponse.json({ error: error.message || "Failed to update admin status" }, { status: 500 });
  }
}
