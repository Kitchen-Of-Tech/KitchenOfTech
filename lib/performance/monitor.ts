/**
 * Performance Monitoring Utilities
 * Tracks Core Web Vitals and custom performance metrics
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, onINP, Metric } from 'web-vitals';

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  navigationType?: string;
}

export interface CustomMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private customMetrics: CustomMetric[] = [];
  private enabled: boolean;
  private debug: boolean;

  constructor() {
    this.enabled = typeof window !== 'undefined' && 'performance' in window;
    this.debug = process.env.NODE_ENV === 'development';

    if (this.enabled) {
      this.initializeWebVitals();
      this.initializePerformanceObserver();
    }
  }

  /**
   * Initialize Web Vitals tracking
   */
  private initializeWebVitals() {
    // Cumulative Layout Shift
    onCLS(this.handleMetric.bind(this), { reportAllChanges: true });

    // First Input Delay (being replaced by INP)
    onFID(this.handleMetric.bind(this));

    // First Contentful Paint
    onFCP(this.handleMetric.bind(this));

    // Largest Contentful Paint
    onLCP(this.handleMetric.bind(this), { reportAllChanges: true });

    // Time to First Byte
    onTTFB(this.handleMetric.bind(this));

    // Interaction to Next Paint (new metric)
    onINP(this.handleMetric.bind(this), { reportAllChanges: true });
  }

  /**
   * Initialize Performance Observer for additional metrics
   */
  private initializePerformanceObserver() {
    if (!('PerformanceObserver' in window)) {
      return;
    }

    try {
      // Observe long tasks (> 50ms)
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackCustomMetric('long-task', entry.duration, 'ms', {
            name: entry.name,
            startTime: entry.startTime,
          });

          if (this.debug) {
            console.warn('[Performance] Long task detected:', {
              duration: `${entry.duration.toFixed(2)}ms`,
              startTime: entry.startTime,
            });
          }
        }
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Observe resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceResourceTiming[]) {
          // Track slow resources (> 1s)
          if (entry.duration > 1000) {
            this.trackCustomMetric('slow-resource', entry.duration, 'ms', {
              name: entry.name,
              type: entry.initiatorType,
              size: entry.transferSize,
            });

            if (this.debug) {
              console.warn('[Performance] Slow resource:', {
                url: entry.name,
                duration: `${entry.duration.toFixed(2)}ms`,
                size: `${(entry.transferSize / 1024).toFixed(2)}KB`,
              });
            }
          }
        }
      });

      resourceObserver.observe({ entryTypes: ['resource'] });

      // Observe navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as PerformanceNavigationTiming[]) {
          this.trackNavigationTiming(entry);
        }
      });

      navigationObserver.observe({ entryTypes: ['navigation'] });
    } catch (error) {
      console.error('[Performance] Observer setup error:', error);
    }
  }

  /**
   * Handle Web Vitals metric
   */
  private handleMetric(metric: Metric) {
    const performanceMetric: PerformanceMetric = {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    };

    this.metrics.set(metric.name, performanceMetric);

    if (this.debug) {
      this.log(`${metric.name}:`, {
        value: `${metric.value.toFixed(2)}${this.getUnit(metric.name)}`,
        rating: metric.rating,
      });
    }

    // Send to analytics
    this.sendMetricToAnalytics(performanceMetric);
  }

  /**
   * Track navigation timing
   */
  private trackNavigationTiming(entry: PerformanceNavigationTiming) {
    const metrics = {
      'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'tcp-connection': entry.connectEnd - entry.connectStart,
      'request-time': entry.responseStart - entry.requestStart,
      'response-time': entry.responseEnd - entry.responseStart,
      'dom-interactive': entry.domInteractive - entry.fetchStart,
      'dom-complete': entry.domComplete - entry.fetchStart,
      'load-complete': entry.loadEventEnd - entry.fetchStart,
    };

    Object.entries(metrics).forEach(([name, value]) => {
      this.trackCustomMetric(name, value, 'ms');
    });

    if (this.debug) {
      this.log('Navigation Timing:', metrics);
    }
  }

  /**
   * Track custom performance metric
   */
  public trackCustomMetric(
    name: string,
    value: number,
    unit: 'ms' | 'bytes' | 'count' = 'ms',
    metadata?: Record<string, any>
  ) {
    const metric: CustomMetric = {
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    };

    this.customMetrics.push(metric);

    // Send to analytics
    this.sendCustomMetricToAnalytics(metric);
  }

  /**
   * Mark a performance point
   */
  public mark(name: string) {
    if (this.enabled && performance.mark) {
      performance.mark(name);
    }
  }

  /**
   * Measure time between two marks
   */
  public measure(name: string, startMark: string, endMark: string): number | null {
    if (!this.enabled || !performance.measure) {
      return null;
    }

    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      if (measures.length > 0) {
        const duration = measures[measures.length - 1].duration;
        this.trackCustomMetric(name, duration, 'ms');
        return duration;
      }
    } catch (error) {
      console.error('[Performance] Measure error:', error);
    }

    return null;
  }

  /**
   * Measure function execution time
   */
  public async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;

    this.mark(startMark);
    const result = await fn();
    this.mark(endMark);

    const duration = this.measure(name, startMark, endMark) || 0;

    return { result, duration };
  }

  /**
   * Get memory usage (if available)
   */
  public getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }

  /**
   * Get all metrics
   */
  public getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get custom metrics
   */
  public getCustomMetrics(): CustomMetric[] {
    return [...this.customMetrics];
  }

  /**
   * Get performance report
   */
  public getReport() {
    const webVitals = this.getMetrics();
    const customMetrics = this.getCustomMetrics();
    const memory = this.getMemoryUsage();

    return {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : null,
      webVitals: webVitals.reduce((acc, metric) => {
        acc[metric.name] = {
          value: metric.value,
          rating: metric.rating,
        };
        return acc;
      }, {} as Record<string, { value: number; rating: string }>),
      customMetrics: customMetrics.map(m => ({
        name: m.name,
        value: m.value,
        unit: m.unit,
      })),
      memory,
      performance: {
        timeOrigin: performance.timeOrigin,
        now: performance.now(),
      },
    };
  }

  /**
   * Send metric to analytics
   */
  private sendMetricToAnalytics(metric: PerformanceMetric) {
    try {
      if (typeof window !== 'undefined' && (window as any).analytics) {
        (window as any).analytics.track('web_vital', {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating,
          metric_id: metric.id,
        });
      }

      // Send to custom endpoint in production
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'web-vital',
            metric,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(() => {
          // Fail silently
        });
      }
    } catch (error) {
      // Fail silently - don't break the app
    }
  }

  /**
   * Send custom metric to analytics
   */
  private sendCustomMetricToAnalytics(metric: CustomMetric) {
    try {
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'custom',
            metric,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(() => {
          // Fail silently
        });
      }
    } catch (error) {
      // Fail silently
    }
  }

  /**
   * Get unit for metric
   */
  private getUnit(metricName: string): string {
    switch (metricName) {
      case 'CLS':
        return '';
      case 'FID':
      case 'FCP':
      case 'LCP':
      case 'TTFB':
      case 'INP':
        return 'ms';
      default:
        return '';
    }
  }

  /**
   * Log messages (only in development)
   */
  private log(...args: any[]) {
    if (this.debug) {
      console.log('[Performance]', ...args);
    }
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Export convenience functions
export const trackMetric = performanceMonitor.trackCustomMetric.bind(performanceMonitor);
export const mark = performanceMonitor.mark.bind(performanceMonitor);
export const measure = performanceMonitor.measure.bind(performanceMonitor);
export const measureAsync = performanceMonitor.measureAsync.bind(performanceMonitor);
export const getPerformanceReport = performanceMonitor.getReport.bind(performanceMonitor);
export const getMemoryUsage = performanceMonitor.getMemoryUsage.bind(performanceMonitor);
