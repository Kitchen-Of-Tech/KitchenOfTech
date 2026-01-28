'use client';

import { useEffect } from 'react';
import { usePageTracking } from './hooks';

/**
 * Analytics Provider Component
 * Handles page tracking and initialization
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Automatically track page views
  usePageTracking();

  // Initialize analytics on mount
  useEffect(() => {
    // Any initialization logic here
    if (typeof window !== 'undefined') {
      console.log('[Analytics] Initialized');
    }
  }, []);

  return <>{children}</>;
}
