import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";
const BYPASS_COOKIE_NAME = 'maintenance_bypass';
const BYPASS_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

// Function to get bypass token from settings
async function getBypassToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/settings`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      return data.success && data.data?.maintenance_bypass_token 
        ? data.data.maintenance_bypass_token 
        : null;
    }
  } catch (error) {
    console.error('Failed to fetch bypass token:', error);
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Block malicious file extensions and suspicious paths
  const maliciousPaths = [
    /\.php$/i,
    /\.asp$/i,
    /\.aspx$/i,
    /\.jsp$/i,
    /\.cgi$/i,
    /wp-admin/i,
    /wp-content/i,
    /wp-includes/i,
    /xmlrpc/i,
    /phpmyadmin/i,
    /adminer/i,
    /\.env$/i,
    /\.git/i,
  ];

  if (maliciousPaths.some(pattern => pattern.test(pathname))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // Ignore static files, API routes, and backoffice
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/backoffice') ||
    pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // Check for bypass token in query parameter FIRST (before maintenance check)
  const bypassToken = searchParams.get('bypass');
  const hasBypassCookie = request.cookies.get(BYPASS_COOKIE_NAME)?.value === 'true';

  // If bypass token is provided, validate it against database
  if (bypassToken) {
    const validToken = await getBypassToken();
    if (validToken && bypassToken === validToken) {
      // Create response - redirect to home (always redirect to home when bypass token is valid)
      const redirectUrl = new URL('/', request.url);
      redirectUrl.searchParams.delete('bypass');
      
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set(BYPASS_COOKIE_NAME, 'true', {
        maxAge: BYPASS_COOKIE_MAX_AGE,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      
      return response;
    }
  }

  // If user has valid bypass cookie, skip maintenance check
  if (hasBypassCookie) {
    // If maintenance mode is OFF and user IS at /maintenance, redirect to home
    try {
      const res = await fetch(`${BACKEND_URL}/api/settings`, { next: { revalidate: 10 } });
      if (res.ok) {
        const data = await res.json();
        const isMaintenance = data.success && data.data.maintenance_mode;
        if (!isMaintenance && pathname === '/maintenance') {
          return NextResponse.redirect(new URL('/', request.url));
        }
      }
    } catch (error) {
      console.error('Middleware settings fetch error:', error);
    }
    return NextResponse.next();
  }

  try {
    // Fetch settings
    // Short cache revalidation to avoid hitting backend too hard but update reasonably fast
    const res = await fetch(`${BACKEND_URL}/api/settings`, { next: { revalidate: 10 } }); 
    
    if (res.ok) {
      const data = await res.json();
      const isMaintenance = data.success && data.data.maintenance_mode;

      if (isMaintenance) {
        // If maintenance mode is ON and user is NOT at /maintenance
        if (pathname !== '/maintenance') {
           return NextResponse.redirect(new URL('/maintenance', request.url))
        }
        return NextResponse.next();
      } else {
        // If maintenance mode is OFF and user IS at /maintenance
        if (pathname === '/maintenance') {
            return NextResponse.redirect(new URL('/', request.url));
        }
      }
    }
  } catch (error) {
    console.error('Middleware settings fetch error:', error);
    // On error, proceed normally to avoid blocking site if backend is down (unless we want fail-safe closed)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

