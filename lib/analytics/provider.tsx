'use client';

import { useEffect, Suspense } from 'react';
import { usePageTracking } from './hooks';

/**
 * Page Tracking Component (wrapped in Suspense)
 */
function PageTracker() {
  usePageTracking();
  return null;
}

/**
 * Analytics Provider Component
 * Handles page tracking and initialization
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize analytics on mount
  useEffect(() => {
    // Any initialization logic here
    if (typeof window !== 'undefined') {
      console.log('[Analytics] Initialized');
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <PageTracker />
      </Suspense>
      {children}
    </>
  );
}
