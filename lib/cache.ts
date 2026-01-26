/**
 * Caching utilities for data fetching
 * 
 * This module provides:
 * 1. React cache() wrappers for database queries
 * 2. Cache tags for Next.js revalidation
 * 3. Stale-while-revalidate patterns
 * 4. Memory caching for frequently accessed data
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';

/**
 * Cache tags for different data types
 * Used for targeted revalidation
 */
export const CACHE_TAGS = {
  // Sanity CMS
  SERVICES: 'services',
  SERVICE_CATEGORIES: 'service-categories',
  SERVICE_SUBCATEGORIES: 'service-subcategories',
  PORTFOLIO: 'portfolio',
  TEAM: 'team',
  TEAM_MEMBER: 'team-member',
  BLOG: 'blog',
  BLOG_POST: 'blog-post',
  TESTIMONIALS: 'testimonials',
  COURSES: 'courses',
  COURSE: 'course',
  BRANDING: 'branding',
  SITE_SETTINGS: 'site-settings',
  FOOTER_SETTINGS: 'footer-settings',
  
  // Supabase
  USER: 'user',
  PROJECTS: 'projects',
  TASKS: 'tasks',
  ENROLLMENTS: 'enrollments',
  PROGRESS: 'progress',
} as const;

/**
 * Cache duration constants (in seconds)
 */
export const CACHE_DURATION = {
  // Static content (rarely changes)
  STATIC: 3600,        // 1 hour
  
  // Semi-static content (changes occasionally)
  SEMI_STATIC: 1800,   // 30 minutes
  
  // Dynamic content (changes frequently)
  DYNAMIC: 300,        // 5 minutes
  
  // Real-time content (changes very frequently)
  REALTIME: 60,        // 1 minute
  
  // No cache (always fresh)
  NO_CACHE: 0,
} as const;

/**
 * Create a cached function with React cache()
 * This ensures the function is only called once per request
 * 
 * @example
 * ```ts
 * const getServices = cachedFunction(async () => {
 *   return await sanityFetch({ query: SERVICES_QUERY });
 * });
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cachedFunction<T extends (...args: any[]) => any>(fn: T): T {
  return cache(fn) as T;
}

/**
 * Create a cached function with Next.js unstable_cache
 * This caches across requests with configurable duration
 * 
 * @example
 * ```ts
 * const getServices = createCachedQuery(
 *   async () => sanityFetch({ query: SERVICES_QUERY }),
 *   ['services'],
 *   { revalidate: 3600, tags: [CACHE_TAGS.SERVICES] }
 * );
 * ```
 */
export function createCachedQuery<T>(
  fn: () => Promise<T>,
  keyParts: string[],
  options: {
    revalidate?: number;
    tags?: string[];
  } = {}
) {
  return unstable_cache(fn, keyParts, {
    revalidate: options.revalidate ?? CACHE_DURATION.SEMI_STATIC,
    tags: options.tags ?? [],
  });
}

/**
 * Wrapper for Sanity queries with intelligent caching
 * Automatically applies appropriate cache duration based on content type
 */
export function cacheSanityQuery<T>(
  fetcher: () => Promise<T>,
  options: {
    key: string;
    tags: string[];
    duration?: number;
  }
): () => Promise<T> {
  return createCachedQuery(
    fetcher,
    ['sanity', options.key],
    {
      revalidate: options.duration ?? CACHE_DURATION.SEMI_STATIC,
      tags: options.tags,
    }
  );
}

/**
 * Wrapper for Supabase queries with intelligent caching
 * Shorter cache duration for dynamic user data
 */
export function cacheSupabaseQuery<T>(
  fetcher: () => Promise<T>,
  options: {
    key: string;
    tags: string[];
    duration?: number;
  }
): () => Promise<T> {
  return createCachedQuery(
    fetcher,
    ['supabase', options.key],
    {
      revalidate: options.duration ?? CACHE_DURATION.DYNAMIC,
      tags: options.tags,
    }
  );
}

/**
 * Deduplicate identical requests within the same render
 * Useful for components that might fetch the same data
 */
export const dedupe = cache;

/**
 * Create a memoized getter that caches the result in memory
 * Use sparingly - only for truly static data
 * 
 * @example
 * ```ts
 * const getStaticData = memoize(() => {
 *   return { heavy: 'computation' };
 * });
 * ```
 */
export function memoize<T>(fn: () => T): () => T {
  let cached: T | undefined;
  let hasCached = false;
  
  return () => {
    if (!hasCached) {
      cached = fn();
      hasCached = true;
    }
    return cached as T;
  };
}

/**
 * Helper to generate cache key from parameters
 */
export function generateCacheKey(
  prefix: string,
  params: Record<string, string | number | boolean>
): string {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  return `${prefix}:${sortedParams}`;
}

/**
 * Type-safe cache tag builder
 */
export function buildCacheTags(...tags: (keyof typeof CACHE_TAGS)[]): string[] {
  return tags.map(tag => CACHE_TAGS[tag]);
}
