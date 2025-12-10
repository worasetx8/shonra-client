import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Get backend URL from environment variable
 * For server-side (API routes): Use BACKEND_URL or internal Docker network name
 * For client-side: Use NEXT_PUBLIC_BACKEND_URL
 */
export function getBackendUrl(): string {
  // Server-side: Use BACKEND_URL or internal Docker network name
  if (typeof window === 'undefined') {
    // Running in Node.js (server-side)
    // Try BACKEND_URL first (for Docker internal network)
    // Fallback to NEXT_PUBLIC_BACKEND_URL (for public URL)
    // Last fallback to internal Docker network name
    return process.env.BACKEND_URL || 
           process.env.NEXT_PUBLIC_BACKEND_URL || 
           'https://api.shonra.com'; // Public URL as fallback
  }
  // Client-side: Use NEXT_PUBLIC_BACKEND_URL
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
}

/**
 * Create default headers for backend requests with User-Agent
 * @returns Headers object with User-Agent and Content-Type
 */
export function createDefaultHeaders(additionalHeaders?: HeadersInit): HeadersInit {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'User-Agent': 'SHONRA-Frontend/1.0',
  };
  
  if (additionalHeaders) {
    return { ...defaultHeaders, ...additionalHeaders };
  }
  
  return defaultHeaders;
}

/**
 * Extract authentication token from request (cookie or Authorization header)
 * @returns token string or null if not found
 */
export function getAuthToken(request: NextRequest): string | null {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');
  return token || null;
}

/**
 * Create headers for authenticated backend requests
 * @returns Headers object with Authorization and Content-Type
 */
export function createAuthHeaders(token: string): HeadersInit {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': 'SHONRA-Frontend/1.0',
  };
}

/**
 * Validate authentication token
 * @returns true if token exists, false otherwise
 */
export function validateAuth(token: string | null): boolean {
  return token !== null && token.trim() !== '';
}

