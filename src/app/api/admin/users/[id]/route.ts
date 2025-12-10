import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getAuthToken, createAuthHeaders, validateAuth } from "@/lib/api-utils";

// DELETE - ลบแอดมิน
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAuthToken(request);

    if (!validateAuth(token)) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการยืนยันตัวตน" }, { status: 401 });
    }

    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/admin/users/${params.id}`, {
      method: "DELETE",
      headers: createAuthHeaders(token!)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || "Failed to delete admin");
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting admin:", error);
    return NextResponse.json({ error: error.message || "Failed to delete admin" }, { status: 500 });
  }
}
