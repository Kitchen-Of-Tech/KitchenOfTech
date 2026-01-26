import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // Adjust this value in production for cost control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture 10% of errors in production, 100% in development
  sampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  
  // Disable Sentry during development if DSN is not configured
  enabled: process.env.NODE_ENV === 'production' || !!SENTRY_DSN,
  
  environment: process.env.NODE_ENV || 'development',
  
  // Ignore common errors
  ignoreErrors: [
    // Browser extensions
    'top.GLOBALS',
    'canvas.contentDocument',
    'MyApp_RemoveAllHighlights',
    'atomicFindClose',
    // Network errors
    'NetworkError',
    'Network request failed',
    // Random plugins/extensions
    'fb_xd_fragment',
  ],
  
  // Add custom tags
  initialScope: {
    tags: {
      'application': 'kitchenoftech',
    },
  },
  
  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events if DSN is not configured
    if (!SENTRY_DSN) {
      return null;
    }
    
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['Authorization'];
      delete event.request.headers['Cookie'];
    }
    
    // Remove sensitive query parameters
    if (event.request?.query_string) {
      const sensitiveParams = ['token', 'key', 'password', 'secret'];
      const queryString = String(event.request.query_string);
      sensitiveParams.forEach(param => {
        if (queryString.includes(param)) {
          event.request!.query_string = queryString.replace(
            new RegExp(`${param}=[^&]+`, 'gi'),
            `${param}=[REDACTED]`
          );
        }
      });
    }
    
    return event;
  },
});
