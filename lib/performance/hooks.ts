'use client';

import { useEffect, useCallback } from 'react';
import { performanceMonitor, CustomMetric } from './monitor';

/**
 * Hook to automatically report performance metrics
 */
export function usePerformanceMonitoring() {
  useEffect(() => {
    // Log performance report on mount
    if (typeof window !== 'undefined') {
      const report = performanceMonitor.getReport();
      console.log('[Performance] Initial report:', report);
    }

    // Log performance report before unload
    const handleBeforeUnload = () => {
      const report = performanceMonitor.getReport();
      console.log('[Performance] Final report:', report);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
}

/**
 * Hook to track component render performance
 */
export function useRenderPerformance(componentName: string) {
  useEffect(() => {
    const startMark = `${componentName}-render-start`;
    const endMark = `${componentName}-render-end`;

    performanceMonitor.mark(startMark);

    return () => {
      performanceMonitor.mark(endMark);
      performanceMonitor.measure(`${componentName}-render`, startMark, endMark);
    };
  }, [componentName]);
}

/**
 * Hook to measure async operations
 */
export function usePerformanceMeasure() {
  const measureAsync = useCallback(async <T,>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> => {
    return performanceMonitor.measureAsync(name, fn);
  }, []);

  const mark = useCallback((name: string) => {
    performanceMonitor.mark(name);
  }, []);

  const measure = useCallback((name: string, startMark: string, endMark: string) => {
    return performanceMonitor.measure(name, startMark, endMark);
  }, []);

  const trackMetric = useCallback((
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' = 'ms',
    metadata?: Record<string, any>
  ) => {
    performanceMonitor.trackCustomMetric(name, value, unit, metadata);
  }, []);

  return {
    measureAsync,
    mark,
    measure,
    trackMetric,
    getReport: () => performanceMonitor.getReport(),
    getMemoryUsage: () => performanceMonitor.getMemoryUsage(),
  };
}

/**
 * Hook to track data fetching performance
 */
export function useDataFetchPerformance() {
  const { measureAsync, trackMetric } = usePerformanceMeasure();

  const trackFetch = useCallback(async <T,>(
    endpoint: string,
    fetchFn: () => Promise<T>
  ): Promise<T> => {
    const { result, duration } = await measureAsync(`fetch-${endpoint}`, fetchFn);

    // Track if slow (> 1s)
    if (duration > 1000) {
      trackMetric('slow-api-call', duration, 'ms', {
        endpoint,
        threshold: 1000,
      });
    }

    return result;
  }, [measureAsync, trackMetric]);

  return { trackFetch };
}

/**
 * Hook to monitor memory usage
 */
export function useMemoryMonitoring(intervalMs: number = 10000) {
  useEffect(() => {
    const checkMemory = () => {
      const memory = performanceMonitor.getMemoryUsage();
      if (memory) {
        // Warn if memory usage > 80%
        if (memory.usagePercentage > 80) {
          console.warn('[Performance] High memory usage:', {
            used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
            limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
            percentage: `${memory.usagePercentage.toFixed(2)}%`,
          });

          performanceMonitor.trackCustomMetric(
            'high-memory-usage',
            memory.usagePercentage,
            'count',
            {
              usedMB: memory.usedJSHeapSize / 1024 / 1024,
              totalMB: memory.totalJSHeapSize / 1024 / 1024,
            }
          );
        }
      }
    };

    const interval = setInterval(checkMemory, intervalMs);
    checkMemory(); // Check immediately

    return () => clearInterval(interval);
  }, [intervalMs]);
}

/**
 * Hook to track route change performance
 */
export function useRouteChangePerformance() {
  useEffect(() => {
    performanceMonitor.mark('route-change-start');

    return () => {
      performanceMonitor.mark('route-change-end');
      performanceMonitor.measure('route-change', 'route-change-start', 'route-change-end');
    };
  }, []);
}
