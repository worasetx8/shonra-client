import { NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/api-utils";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";
    const status = searchParams.get("status") || "active";
    const search = searchParams.get("search") || "";

    const params: Record<string, string> = {
      page,
      limit,
      status
    };

    // Only add search if it's not empty
    if (search) {
      params.search = search;
    }

    const BACKEND_URL = getBackendUrl();
    const apiUrl = `${BACKEND_URL}/api/products/saved?${new URLSearchParams(params)}`;
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
    console.error("Get Saved Products API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch saved products"
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { itemId, status } = body;

    if (!itemId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "Item ID and status are required"
        },
        { status: 400 }
      );
    }

    const BACKEND_URL = getBackendUrl();
    const apiUrl = `${BACKEND_URL}/api/products/status`;
    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ itemId, status })
    });

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
    console.error("Update Product Status API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update product status"
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { itemId, status } = body;

    if (!itemId || !status) {
      return NextResponse.json(
        {
          success: false,
          message: "ItemId and status are required"
        },
        { status: 400 }
      );
    }

    const apiUrl = `${BACKEND_URL}/api/products/status`;

    const response = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ itemId, status })
    });

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
    console.error("Update Product Status API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update product status"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id, itemId } = body;

    // Support both id (database ID) and itemId (product ID)
    const targetId = id || itemId;

    if (!targetId) {
      return NextResponse.json(
        {
          success: false,
          message: "Product ID is required"
        },
        { status: 400 }
      );
    }

    const apiUrl = `${BACKEND_URL}/api/products/saved/delete`;
    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: targetId })
    });

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
    console.error("Delete Product API Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to delete product"
      },
      { status: 500 }
    );
  }
}
