import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Get backend URL from environment variable
 */
export function getBackendUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';
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
    'Content-Type': 'application/json'
  };
}

/**
 * Validate authentication token
 * @returns true if token exists, false otherwise
 */
export function validateAuth(token: string | null): boolean {
  return token !== null && token.trim() !== '';
}

