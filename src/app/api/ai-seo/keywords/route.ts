import { NextRequest, NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const BACKEND_URL = getBackendUrl();

    const response = await fetch(`${BACKEND_URL}/api/ai-seo/keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate keywords',
        error: error.message,
      },
      { status: 500 }
    );
  }
}


