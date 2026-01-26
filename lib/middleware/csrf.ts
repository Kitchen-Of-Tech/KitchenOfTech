/**
 * CSRF Protection Middleware
 * 
 * Protects against Cross-Site Request Forgery attacks by validating
 * CSRF tokens on state-changing operations (POST, PATCH, PUT, DELETE)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * CSRF token cookie name
 */
const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * CSRF token header name
 */
const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Token expiration time (1 hour)
 */
const TOKEN_EXPIRATION = 3600 * 1000;

/**
 * Generate a secure CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Get or create CSRF token from cookies
 * Call this in GET requests to ensure token exists
 */
export async function getCsrfToken(): Promise<string> {
  const cookieStore = await cookies();
  let token = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  if (!token) {
    token = generateCsrfToken();
    cookieStore.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_EXPIRATION / 1000, // Convert to seconds
      path: '/',
    });
  }
  
  return token;
}

/**
 * Validate CSRF token from request
 * Compares token from header with token from cookie
 * 
 * @param request - The incoming request
 * @returns true if valid, false if invalid
 */
export async function validateCsrfToken(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  
  // Get token from cookie
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  
  // Both must exist and match
  if (!cookieToken || !headerToken) {
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(cookieToken),
    Buffer.from(headerToken)
  );
}

/**
 * Middleware to require CSRF token on state-changing requests
 * 
 * Usage in API routes:
 * ```ts
 * export async function POST(request: NextRequest) {
 *   const csrfValid = await requireCsrfToken(request);
 *   if (!csrfValid) return csrfValid;
 *   
 *   // Continue with request handling
 * }
 * ```
 */
export async function requireCsrfToken(
  request: NextRequest
): Promise<NextResponse | null> {
  const method = request.method;
  
  // Only validate on state-changing methods
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    const isValid = await validateCsrfToken(request);
    
    if (!isValid) {
      return NextResponse.json(
        { 
          error: 'Invalid CSRF token',
          message: 'CSRF token is missing or invalid. Please refresh the page and try again.',
        },
        { status: 403 }
      );
    }
  }
  
  // Return null to indicate validation passed
  return null;
}

/**
 * Add CSRF token to response headers
 * Call this in GET requests to send token to client
 * 
 * @param response - The response to add token to
 * @param token - The CSRF token (if not provided, will get from cookies)
 */
export async function addCsrfTokenToResponse(
  response: NextResponse,
  token?: string
): Promise<NextResponse> {
  if (!token) {
    token = await getCsrfToken();
  }
  
  // Add token to response header so client can access it
  response.headers.set(CSRF_HEADER_NAME, token);
  
  return response;
}

/**
 * Helper to create a response with CSRF token
 * Combines JSON response with CSRF token in headers
 * 
 * @example
 * ```ts
 * return csrfJsonResponse({ data: 'example' });
 * ```
 */
export async function csrfJsonResponse<T>(
  data: T,
  status: number = 200
): Promise<NextResponse> {
  const response = NextResponse.json(data, { status });
  return addCsrfTokenToResponse(response);
}

/**
 * Client-side helper functions (for use in frontend)
 * Export as constants that can be used in fetch requests
 */
export const CSRF_CONFIG = {
  /**
   * Cookie name for CSRF token
   */
  COOKIE_NAME: CSRF_COOKIE_NAME,
  
  /**
   * Header name for CSRF token
   */
  HEADER_NAME: CSRF_HEADER_NAME,
  
  /**
   * Get CSRF token from cookie (client-side)
   * Usage: const token = CSRF_CONFIG.getToken();
   */
  getToken: () => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === CSRF_COOKIE_NAME) {
        return decodeURIComponent(value);
      }
    }
    return null;
  },
  
  /**
   * Add CSRF token to fetch headers (client-side)
   * Usage: fetch(url, { ...CSRF_CONFIG.fetchHeaders() })
   */
  fetchHeaders: () => {
    const token = CSRF_CONFIG.getToken();
    return token ? { [CSRF_HEADER_NAME]: token } : {};
  },
} as const;
