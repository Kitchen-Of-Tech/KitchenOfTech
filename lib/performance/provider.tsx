'use client';

import { usePerformanceMonitoring, useMemoryMonitoring } from './hooks';

/**
 * Performance Monitoring Provider
 * Initializes performance tracking and monitoring
 */
export function PerformanceProvider({ children }: { children: React.ReactNode }) {
  // Initialize performance monitoring
  usePerformanceMonitoring();

  // Monitor memory usage (check every 30 seconds)
  useMemoryMonitoring(30000);

  return <>{children}</>;
}
