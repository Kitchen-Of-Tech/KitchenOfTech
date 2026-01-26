import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  debug: false,
  
  enabled: process.env.NODE_ENV === 'production' || !!SENTRY_DSN,
  
  environment: process.env.NODE_ENV || 'development',
  
  initialScope: {
    tags: {
      'application': 'kitchenoftech',
      'runtime': 'node',
    },
  },
  
  beforeSend(event) {
    // Don't send events if DSN is not configured
    if (!SENTRY_DSN) {
      return null;
    }
    
    // Remove sensitive data from server-side errors
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
      delete event.request.headers['X-API-Key'];
    }
    
    // Remove sensitive environment variables
    if (event.contexts?.runtime?.['env']) {
      const env = event.contexts.runtime['env'] as Record<string, unknown>;
      Object.keys(env).forEach(key => {
        if (
          key.includes('KEY') ||
          key.includes('SECRET') ||
          key.includes('TOKEN') ||
          key.includes('PASSWORD')
        ) {
          env[key] = '[REDACTED]';
        }
      });
    }
    
    return event;
  },
});
