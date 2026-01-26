import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';
import type { Duration } from '@upstash/ratelimit';

/**
 * Initialize Redis client for rate limiting
 * Falls back to in-memory rate limiting if Redis credentials are not configured
 */
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Get client identifier from request
 * Uses IP address or fallback to a default for rate limiting
 */
function getIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'anonymous';
  return ip;
}

/**
 * Create rate limiter with specified limits
 */
function createRateLimiter(requests: number, window: Duration) {
  if (!redis) {
    // In-memory fallback for development (requires dummy redis)
    console.warn('Redis not configured. Using in-memory rate limiting (not suitable for production).');
    
    // Create a minimal in-memory store that mimics Redis
    const memoryStore = new Map<string, { count: number; reset: number }>();
    
    return new Ratelimit({
      redis: {
        sadd: async () => 0,
        eval: async () => 0,
        get: async (key: string) => {
          const data = memoryStore.get(key);
          if (!data || Date.now() > data.reset) return null;
          return data.count.toString();
        },
        set: async (key: string, value: string) => {
          const windowMs = typeof window === 'string' && window.includes('h') 
            ? 3600000 
            : typeof window === 'string' && window.includes('m') 
            ? 60000 
            : 1000;
          memoryStore.set(key, {
            count: parseInt(value),
            reset: Date.now() + windowMs,
          });
          return 'OK';
        },
      } as any,
      limiter: Ratelimit.slidingWindow(requests, window),
      analytics: false,
      prefix: 'ratelimit',
    });
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: 'ratelimit',
  });
}

/**
 * Rate limiters for different use cases
 */
export const rateLimiters = {
  // Authentication: 5 requests per minute
  auth: createRateLimiter(5, '1 m' as Duration),
  
  // Testimonial submission: 2 requests per hour
  testimonial: createRateLimiter(2, '1 h' as Duration),
  
  // Payment submission: 10 requests per hour
  payment: createRateLimiter(10, '1 h' as Duration),
  
  // General API: 100 requests per minute
  api: createRateLimiter(100, '1 m' as Duration),
  
  // Strict API: 20 requests per minute (for sensitive operations)
  apiStrict: createRateLimiter(20, '1 m' as Duration),
  
  // File upload: 5 requests per 10 minutes
  upload: createRateLimiter(5, '10 m' as Duration),
};

/**
 * Apply rate limiting to a request
 * Returns success/error response
 */
export async function rateLimit(
  request: NextRequest,
  limiter: Ratelimit
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const identifier = getIdentifier(request);

  try {
    const { success, limit, reset, remaining } = await limiter.limit(identifier);

    // Add rate limit headers to response
    const headers = {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    };

    if (!success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: new Date(reset).toISOString(),
          },
          { 
            status: 429,
            headers,
          }
        ),
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // On error, allow the request through (fail open)
    return { success: true };
  }
}

/**
 * Helper: Apply rate limit and return early if exceeded
 * Usage in API routes:
 * 
 * const rateLimitCheck = await applyRateLimit(request, rateLimiters.auth);
 * if (rateLimitCheck) return rateLimitCheck;
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: Ratelimit
): Promise<NextResponse | null> {
  const result = await rateLimit(request, limiter);
  return result.success ? null : result.response;
}

/**
 * Middleware factory for rate limiting
 * Wraps your handler with rate limiting logic
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  limiter: Ratelimit
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResult = await rateLimit(request, limiter);
    
    if (!rateLimitResult.success) {
      return rateLimitResult.response;
    }

    return handler(request);
  };
}
