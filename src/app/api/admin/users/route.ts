import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl, getAuthToken, createAuthHeaders, validateAuth } from "@/lib/api-utils";

export const dynamic = 'force-dynamic';

// GET - ดึงรายการแอดมินทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request);

    if (!validateAuth(token)) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการยืนยันตัวตน" }, { status: 401 });
    }

    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
      method: "GET",
      headers: createAuthHeaders(token!)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend response:", response.status, errorText);
      throw new Error(`Backend error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching admins:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch admins" }, { status: 500 });
  }
}

// POST - สร้างแอดมินใหม่
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = getAuthToken(request);

    if (!validateAuth(token)) {
      return NextResponse.json({ error: "ไม่พบข้อมูลการยืนยันตัวตน" }, { status: 401 });
    }

    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/admin/users`, {
      method: "POST",
      headers: createAuthHeaders(token!),
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorData.error || "Failed to create admin");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: error.message || "Failed to create admin" }, { status: 500 });
  }
}
