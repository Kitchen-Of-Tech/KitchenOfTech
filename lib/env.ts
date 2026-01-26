/**
 * Type-Safe Environment Variables
 * 
 * This module provides type-safe access to environment variables with runtime validation.
 * All environment variables are validated at startup to catch configuration errors early.
 * 
 * Usage:
 * ```ts
 * import { env } from '@/lib/env';
 * 
 * const apiUrl = env.NEXT_PUBLIC_SITE_URL;
 * const dbUrl = env.SUPABASE_URL;
 * ```
 */

import { z } from 'zod';

/**
 * Environment variable schema
 * 
 * IMPORTANT RULES:
 * 1. Public variables (NEXT_PUBLIC_*) are exposed to the browser
 * 2. Private variables are only available on the server
 * 3. All required variables must be defined in .env.local
 * 4. Optional variables should have sensible defaults
 */
const envSchema = z.object({
  // ========================================
  // Node Environment
  // ========================================
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // ========================================
  // Next.js Public Variables (Browser + Server)
  // ========================================
  NEXT_PUBLIC_SITE_URL: z.string().url().default('http://localhost:3000'),
  
  // ========================================
  // Sanity CMS (Server Only)
  // ========================================
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1, 'Sanity project ID is required'),
  NEXT_PUBLIC_SANITY_DATASET: z.string().default('production'),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().default('2024-01-01'),
  SANITY_API_TOKEN: z.string().optional(), // Editor token for writes
  
  // ========================================
  // Supabase (Server Only for service_role)
  // ========================================
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required'),
  
  // ========================================
  // Authentication
  // ========================================
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  
  // ========================================
  // Email Service (Resend)
  // ========================================
  RESEND_API_KEY: z.string().min(1, 'Resend API key is required'),
  FROM_EMAIL: z.string().email().default('noreply@kitchenoftech.com'),
  
  // ========================================
  // Rate Limiting (Upstash Redis) - OPTIONAL
  // ========================================
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // ========================================
  // Error Monitoring (Sentry) - OPTIONAL
  // ========================================
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  
  // ========================================
  // Payment Gateway
  // ========================================
  PAYMENT_WEBHOOK_SECRET: z.string().optional(),
  
  // ========================================
  // Analytics (Optional)
  // ========================================
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  
  // ========================================
  // Feature Flags
  // ========================================
  ENABLE_ANALYTICS: z.enum(['true', 'false']).default('false'),
  ENABLE_RATE_LIMITING: z.enum(['true', 'false']).default('true'),
  ENABLE_ERROR_MONITORING: z.enum(['true', 'false']).default('true'),
});

/**
 * Validated environment variables
 * 
 * This object is created once at module load time and cached.
 * If validation fails, the app will throw an error and refuse to start.
 */
let _env: z.infer<typeof envSchema> | null = null;

/**
 * Get validated environment variables
 * 
 * @throws {Error} If environment variables are invalid
 */
function getEnv(): z.infer<typeof envSchema> {
  if (_env) {
    return _env;
  }

  const parsed = envSchema.safeParse({
    // Node
    NODE_ENV: process.env.NODE_ENV,
    
    // Site
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    
    // Sanity
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION,
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
    
    // Supabase
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    
    // Auth
    JWT_SECRET: process.env.JWT_SECRET,
    
    // Email
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    FROM_EMAIL: process.env.FROM_EMAIL,
    
    // Rate Limiting
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    
    // Sentry
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    
    // Payment
    PAYMENT_WEBHOOK_SECRET: process.env.PAYMENT_WEBHOOK_SECRET,
    
    // Analytics
    NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    
    // Feature Flags
    ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
    ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING,
    ENABLE_ERROR_MONITORING: process.env.ENABLE_ERROR_MONITORING,
  });

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    
    const errorMessages = parsed.error.issues.map(
      err => `  - ${err.path.join('.')}: ${err.message}`
    ).join('\n');
    
    throw new Error(
      `Environment validation failed. Please check your .env.local file:\n${errorMessages}`
    );
  }

  _env = parsed.data;
  return _env;
}

/**
 * Validated and type-safe environment variables
 * 
 * Use this instead of process.env for type safety and runtime validation.
 * 
 * @example
 * ```ts
 * import { env } from '@/lib/env';
 * 
 * // TypeScript knows the type and guarantees it exists
 * const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID; // string
 * 
 * // Optional variables have proper types
 * const sentryDsn = env.SENTRY_DSN; // string | undefined
 * ```
 */
export const env = getEnv();

/**
 * Check if a feature is enabled
 * 
 * @param feature - Feature flag name
 * @returns Whether the feature is enabled
 */
export function isFeatureEnabled(feature: 'analytics' | 'rate_limiting' | 'error_monitoring'): boolean {
  switch (feature) {
    case 'analytics':
      return env.ENABLE_ANALYTICS === 'true' && !!env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    case 'rate_limiting':
      return env.ENABLE_RATE_LIMITING === 'true';
    case 'error_monitoring':
      return env.ENABLE_ERROR_MONITORING === 'true' && !!env.SENTRY_DSN;
    default:
      return false;
  }
}

/**
 * Get the current environment
 * 
 * @returns 'development', 'production', or 'test'
 */
export function getEnvironment(): 'development' | 'production' | 'test' {
  return env.NODE_ENV;
}

/**
 * Check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Check if running in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Validate environment variables at startup
 * 
 * Call this in your app's entry point (app/layout.tsx or instrumentation.ts)
 * to catch configuration errors early.
 * 
 * @throws {Error} If validation fails
 */
export function validateEnv(): void {
  try {
    getEnv();
    
    if (isDevelopment) {
      console.log('✅ Environment variables validated successfully');
      
      // Log optional services status
      console.log('📊 Optional Services:');
      console.log(`  - Rate Limiting: ${isFeatureEnabled('rate_limiting') ? '✅ Enabled' : '❌ Disabled (in-memory fallback)'}`);
      console.log(`  - Error Monitoring: ${isFeatureEnabled('error_monitoring') ? '✅ Enabled' : '❌ Disabled'}`);
      console.log(`  - Analytics: ${isFeatureEnabled('analytics') ? '✅ Enabled' : '❌ Disabled'}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
    throw error;
  }
}

// Validate on module load in non-test environments
if (!isTest) {
  validateEnv();
}
