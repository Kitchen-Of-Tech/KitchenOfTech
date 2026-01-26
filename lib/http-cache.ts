/**
 * HTTP Cache utilities for API routes
 * 
 * These utilities help add proper Cache-Control headers to API responses
 */

import { NextResponse } from 'next/server';

/**
 * Cache duration presets (in seconds)
 */
export const HTTP_CACHE_DURATION = {
  /** No caching - always fetch fresh */
  NO_CACHE: 0,
  
  /** 1 minute - for real-time data */
  REALTIME: 60,
  
  /** 5 minutes - for frequently changing data */
  SHORT: 300,
  
  /** 15 minutes - for moderately dynamic data */
  MEDIUM: 900,
  
  /** 1 hour - for semi-static data */
  LONG: 3600,
  
  /** 1 day - for static data */
  VERY_LONG: 86400,
} as const;

/**
 * Cache strategies
 */
export type CacheStrategy = 
  | 'no-cache'           // No caching
  | 'public'             // Cache on browser and CDN
  | 'private'            // Cache only on browser (user-specific data)
  | 'stale-while-revalidate';  // Serve stale while fetching fresh

/**
 * Generate Cache-Control header value
 * 
 * @param strategy - Caching strategy
 * @param maxAge - Max age in seconds
 * @param staleWhileRevalidate - SWR duration in seconds (optional)
 * 
 * @example
 * ```ts
 * const cacheControl = getCacheControlHeader('public', 3600);
 * // Returns: "public, max-age=3600, must-revalidate"
 * ```
 */
export function getCacheControlHeader(
  strategy: CacheStrategy,
  maxAge: number = 0,
  staleWhileRevalidate?: number
): string {
  if (strategy === 'no-cache') {
    return 'no-store, no-cache, must-revalidate, proxy-revalidate';
  }
  
  const parts: string[] = [strategy];
  
  if (maxAge > 0) {
    parts.push(`max-age=${maxAge}`);
  }
  
  if (staleWhileRevalidate && staleWhileRevalidate > 0) {
    parts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }
  
  parts.push('must-revalidate');
  
  return parts.join(', ');
}

/**
 * Add cache headers to a NextResponse
 * 
 * @example
 * ```ts
 * const response = NextResponse.json({ data: 'example' });
 * return withCacheHeaders(response, 'public', HTTP_CACHE_DURATION.LONG);
 * ```
 */
export function withCacheHeaders(
  response: NextResponse,
  strategy: CacheStrategy = 'public',
  maxAge: number = HTTP_CACHE_DURATION.SHORT,
  staleWhileRevalidate?: number
): NextResponse {
  const cacheControl = getCacheControlHeader(strategy, maxAge, staleWhileRevalidate);
  response.headers.set('Cache-Control', cacheControl);
  
  // Add ETag support for conditional requests
  const etag = generateETag(response);
  if (etag) {
    response.headers.set('ETag', etag);
  }
  
  return response;
}

/**
 * Create a cached JSON response
 * 
 * @example
 * ```ts
 * return cachedJsonResponse(
 *   { data: services },
 *   { strategy: 'public', maxAge: 3600, swr: 60 }
 * );
 * ```
 */
export function cachedJsonResponse<T>(
  data: T,
  options: {
    strategy?: CacheStrategy;
    maxAge?: number;
    swr?: number;
    status?: number;
  } = {}
): NextResponse {
  const {
    strategy = 'public',
    maxAge = HTTP_CACHE_DURATION.SHORT,
    swr,
    status = 200,
  } = options;
  
  const response = NextResponse.json(data, { status });
  return withCacheHeaders(response, strategy, maxAge, swr);
}

/**
 * Create an uncached JSON response (for POST/PATCH/DELETE)
 */
export function uncachedJsonResponse<T>(data: T, status: number = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return withCacheHeaders(response, 'no-cache');
}

/**
 * Generate ETag from response body
 * Simple hash for now - can be improved with better hashing
 */
function generateETag(response: NextResponse): string | null {
  try {
    // Get response body
    const body = response.body;
    if (!body) return null;
    
    // Simple hash based on stringified content
    // In production, use a proper hash function like MD5 or SHA-256
    const bodyString = JSON.stringify(body);
    const hash = simpleHash(bodyString);
    
    return `W/"${hash}"`;
  } catch {
    return null;
  }
}

/**
 * Simple string hash function
 * For production, use crypto.subtle.digest() or similar
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if request has conditional headers (If-None-Match)
 * and return 304 Not Modified if ETag matches
 * 
 * @example
 * ```ts
 * export async function GET(request: Request) {
 *   const data = await fetchData();
 *   const response = cachedJsonResponse(data);
 *   
 *   // Check if client cache is still valid
 *   const conditional = checkConditionalRequest(request, response);
 *   if (conditional) return conditional;
 *   
 *   return response;
 * }
 * ```
 */
export function checkConditionalRequest(
  request: Request,
  response: NextResponse
): NextResponse | null {
  const ifNoneMatch = request.headers.get('If-None-Match');
  const etag = response.headers.get('ETag');
  
  if (ifNoneMatch && etag && ifNoneMatch === etag) {
    return new NextResponse(null, { 
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': response.headers.get('Cache-Control') || '',
      },
    });
  }
  
  return null;
}

/**
 * Presets for common API response types
 */
export const CACHE_PRESETS = {
  /** Static data that rarely changes (categories, settings) */
  STATIC: {
    strategy: 'public' as CacheStrategy,
    maxAge: HTTP_CACHE_DURATION.VERY_LONG,
    swr: HTTP_CACHE_DURATION.LONG,
  },
  
  /** Semi-static data (services, portfolio, team) */
  SEMI_STATIC: {
    strategy: 'public' as CacheStrategy,
    maxAge: HTTP_CACHE_DURATION.LONG,
    swr: HTTP_CACHE_DURATION.MEDIUM,
  },
  
  /** Dynamic data (blog posts, courses) */
  DYNAMIC: {
    strategy: 'public' as CacheStrategy,
    maxAge: HTTP_CACHE_DURATION.MEDIUM,
    swr: HTTP_CACHE_DURATION.SHORT,
  },
  
  /** User-specific data (profile, enrollments) */
  PRIVATE: {
    strategy: 'private' as CacheStrategy,
    maxAge: HTTP_CACHE_DURATION.SHORT,
  },
  
  /** Real-time data (notifications, live updates) */
  REALTIME: {
    strategy: 'private' as CacheStrategy,
    maxAge: HTTP_CACHE_DURATION.REALTIME,
  },
  
  /** No caching (mutations, sensitive operations) */
  NO_CACHE: {
    strategy: 'no-cache' as CacheStrategy,
    maxAge: 0,
  },
} as const;
