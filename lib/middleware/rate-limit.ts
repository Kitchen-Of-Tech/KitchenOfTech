import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit, type Duration } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limit configurations
export const RATE_LIMITS = {
  authentication: {
    requests: 5,
    window: '5 m',
  },
  mutations: {
    requests: 10,
    window: '1 m',
  },
  queries: {
    requests: 30,
    window: '1 m',
  },
  fileUploads: {
    requests: 3,
    window: '5 m',
  },
} as const;

// Create rate limiters
const createRateLimiter = (requests: number, window: Duration) => {
  if (!redis) {
    // Return a dummy rate limiter that always allows requests
    return {
      limit: async () => ({
        success: true,
        limit: requests,
        remaining: requests,
        reset: Date.now() + 60000,
        pending: Promise.resolve(),
      }),
    } as unknown as Ratelimit;
  }

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: 'ratelimit',
    analytics: true,
  });
};

// Rate limiters for different endpoint types
export const rateLimiters = {
  authentication: createRateLimiter(RATE_LIMITS.authentication.requests, RATE_LIMITS.authentication.window),
  mutations: createRateLimiter(RATE_LIMITS.mutations.requests, RATE_LIMITS.mutations.window),
  queries: createRateLimiter(RATE_LIMITS.queries.requests, RATE_LIMITS.queries.window),
  fileUploads: createRateLimiter(RATE_LIMITS.fileUploads.requests, RATE_LIMITS.fileUploads.window),
};

export type RateLimitType = keyof typeof rateLimiters;

/**
 * Rate limiting middleware for API routes
 * 
 * @param request - Next.js request object
 * @param type - Type of rate limit to apply (authentication, mutations, queries, fileUploads)
 * @returns Response if rate limit exceeded, null otherwise
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  type: RateLimitType = 'queries'
): Promise<NextResponse | null> {
  try {
    // Skip rate limiting if Redis is not configured
    if (!redis) {
      console.warn('Redis not configured, skipping rate limiting');
      return null;
    }

    // Get IP address from headers or use a default
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               'anonymous';

    const identifier = `${ip}-${type}`;
    const rateLimiter = rateLimiters[type];

    const { success, limit, remaining, reset } = await rateLimiter.limit(identifier);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          limit,
          remaining: 0,
          reset: new Date(reset).toISOString(),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Add rate limit headers to response (will be handled by caller)
    return null;
  } catch (error) {
    console.error('Rate limit error:', error);
    // Don't block requests if rate limiting fails
    return null;
  }
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  reset: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());
  return response;
}

/**
 * Check rate limit and return limit info
 * Use this when you need the rate limit info but want to handle the response yourself
 */
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType = 'queries'
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               'anonymous';

    const identifier = `${ip}-${type}`;
    const rateLimiter = rateLimiters[type];

    return await rateLimiter.limit(identifier);
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Return success if rate limiting fails to avoid blocking legitimate requests
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: Date.now(),
    };
  }
}
