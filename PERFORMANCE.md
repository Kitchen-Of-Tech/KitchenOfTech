# Performance Monitoring Guide

Kitchen of Tech implements comprehensive performance monitoring to ensure optimal user experience and identify bottlenecks.

## Overview

We track multiple performance metrics:

1. **Core Web Vitals** - Google's metrics for user experience
2. **Custom Metrics** - Application-specific performance data
3. **Resource Loading** - Script, stylesheet, and image loading times
4. **API Performance** - Backend response times
5. **Memory Usage** - JavaScript heap memory consumption

## Core Web Vitals

### Largest Contentful Paint (LCP)

**Measures**: Loading performance
**Target**: < 2.5 seconds
**Good**: < 2.5s | **Needs Improvement**: 2.5s - 4s | **Poor**: > 4s

LCP measures when the largest content element becomes visible. This is typically the hero image, video, or large text block.

**Optimization Tips**:
- Optimize images (use Next.js Image component)
- Use CDN for static assets
- Implement code splitting
- Preload critical resources
- Remove render-blocking resources

### Interaction to Next Paint (INP)

**Measures**: Interactivity and responsiveness
**Target**: < 200 milliseconds
**Good**: < 200ms | **Needs Improvement**: 200ms - 500ms | **Poor**: > 500ms

INP measures the time from user interaction to when the browser paints the next frame.

**Optimization Tips**:
- Minimize JavaScript execution time
- Use web workers for heavy computations
- Debounce/throttle event handlers
- Avoid long tasks (> 50ms)
- Use React.lazy() for code splitting

### Cumulative Layout Shift (CLS)

**Measures**: Visual stability
**Target**: < 0.1
**Good**: < 0.1 | **Needs Improvement**: 0.1 - 0.25 | **Poor**: > 0.25

CLS measures unexpected layout shifts during page load.

**Optimization Tips**:
- Set explicit dimensions for images and videos
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS `aspect-ratio` property
- Preload fonts

### First Contentful Paint (FCP)

**Measures**: Perceived loading speed
**Target**: < 1.8 seconds
**Good**: < 1.8s | **Needs Improvement**: 1.8s - 3s | **Poor**: > 3s

FCP measures when the first content is painted.

**Optimization Tips**:
- Minimize server response time
- Eliminate render-blocking resources
- Use font-display: swap
- Minimize critical request depth
- Reduce JavaScript execution time

### Time to First Byte (TTFB)

**Measures**: Server response time
**Target**: < 600 milliseconds
**Good**: < 600ms | **Needs Improvement**: 600ms - 1.8s | **Poor**: > 1.8s

TTFB measures time from navigation start to receiving the first byte.

**Optimization Tips**:
- Use CDN (Vercel Edge Network)
- Implement caching strategies
- Optimize database queries
- Use connection pooling
- Enable HTTP/2

## Implementation

### Automatic Monitoring

Performance monitoring is automatically enabled via the `PerformanceProvider`:

```tsx
import { PerformanceProvider } from '@/lib/performance/provider';

// In your root layout
<PerformanceProvider>
  {children}
</PerformanceProvider>
```

### Manual Tracking

Use hooks for custom performance tracking:

```tsx
'use client';

import { usePerformanceMeasure } from '@/lib/performance/hooks';

export function MyComponent() {
  const { measureAsync, trackMetric } = usePerformanceMeasure();

  const handleSubmit = async (data: FormData) => {
    const { result, duration } = await measureAsync(
      'form-submission',
      async () => {
        return await submitForm(data);
      }
    );

    // Track custom metric
    trackMetric('form-submission-time', duration, 'ms');
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Track Component Render Performance

```tsx
import { useRenderPerformance } from '@/lib/performance/hooks';

export function HeavyComponent() {
  useRenderPerformance('HeavyComponent');

  return <div>...</div>;
}
```

### Track Data Fetching

```tsx
import { useDataFetchPerformance } from '@/lib/performance/hooks';

export function DataComponent() {
  const { trackFetch } = useDataFetchPerformance();

  const fetchData = async () => {
    const data = await trackFetch('/api/data', async () => {
      const response = await fetch('/api/data');
      return response.json();
    });

    return data;
  };

  // ...
}
```

### Memory Monitoring

```tsx
import { useMemoryMonitoring } from '@/lib/performance/hooks';

export function MemoryIntensiveComponent() {
  // Check memory every 10 seconds
  useMemoryMonitoring(10000);

  return <div>...</div>;
}
```

## Performance Budgets

We enforce the following performance budgets:

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| LCP | < 2.5s | TBD | 🟢 |
| INP | < 200ms | TBD | 🟢 |
| CLS | < 0.1 | TBD | 🟢 |
| FCP | < 1.8s | TBD | 🟢 |
| TTFB | < 600ms | TBD | 🟢 |
| Bundle Size | < 200KB | TBD | 🟢 |
| Image Size | < 100KB | TBD | 🟢 |

## Monitoring Tools

### 1. Vercel Speed Insights

Automatic Core Web Vitals tracking on Vercel:

- Real user metrics (RUM)
- Geographic distribution
- Device breakdown
- Page-by-page analysis

**Access**: [Vercel Dashboard](https://vercel.com/dashboard) > Project > Speed Insights

### 2. Lighthouse

Run comprehensive audits locally:

```powershell
npm run lighthouse
```

This generates a detailed report including:
- Performance score
- Accessibility score
- Best practices score
- SEO score

### 3. Chrome DevTools

**Performance Tab**:
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Interact with page
5. Stop recording
6. Analyze flame chart

**Network Tab**:
- View resource loading waterfall
- Check cache headers
- Identify slow requests
- Analyze bundle sizes

**Coverage Tab**:
- Identify unused JavaScript
- Find unused CSS
- Optimize bundle splitting

### 4. WebPageTest

External testing with real browsers:

1. Go to [webpagetest.org](https://www.webpagetest.org/)
2. Enter your URL
3. Select test location
4. View detailed waterfall and filmstrip

## Optimization Strategies

### 1. Image Optimization

```tsx
import Image from 'next/image';

// ✅ Optimized
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // For above-the-fold images
  quality={85}
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// ❌ Not optimized
<img src="/hero.jpg" alt="Hero" />
```

### 2. Code Splitting

```tsx
import dynamic from 'next/dynamic';

// ✅ Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // If not needed on server
});

// ❌ Import everything upfront
import { HeavyComponent } from './HeavyComponent';
```

### 3. Resource Hints

```tsx
// In your layout or head
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="dns-prefetch" href="https://cdn.sanity.io" />
<link rel="preload" href="/hero.jpg" as="image" />
```

### 4. Caching Strategy

```typescript
// API route with caching
export async function GET() {
  const data = await fetchData();

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
```

### 5. Database Optimization

```typescript
// ✅ Use indexes
await supabase
  .from('posts')
  .select('*')
  .eq('category_id', categoryId) // Indexed column
  .order('created_at', { ascending: false })
  .limit(10);

// ✅ Use select specific columns
await supabase
  .from('users')
  .select('id, name, email')
  .eq('id', userId);

// ❌ Select all without indexes
await supabase
  .from('posts')
  .select('*');
```

## Performance Checklist

### Before Deployment

- [ ] Run Lighthouse audit (score > 90)
- [ ] Check bundle sizes (`npm run build`)
- [ ] Verify images are optimized
- [ ] Test on slow 3G connection
- [ ] Test on low-end mobile device
- [ ] Check for memory leaks
- [ ] Verify caching headers
- [ ] Test with disabled JavaScript (progressive enhancement)
- [ ] Run accessibility audit
- [ ] Check for console errors

### Ongoing Monitoring

- [ ] Monitor Core Web Vitals weekly
- [ ] Review Vercel Speed Insights monthly
- [ ] Check for performance regressions in CI
- [ ] Analyze slow API endpoints
- [ ] Review JavaScript bundle size
- [ ] Check for unused dependencies
- [ ] Monitor memory usage patterns
- [ ] Review long task warnings

## Troubleshooting

### High LCP

**Common Causes**:
- Large unoptimized images
- Slow server response (TTFB)
- Render-blocking resources
- Client-side rendering delays

**Solutions**:
1. Optimize images with Next.js Image
2. Use priority prop for hero images
3. Implement caching strategies
4. Remove unnecessary render-blocking scripts
5. Use `loading="eager"` for critical images

### High INP

**Common Causes**:
- Long JavaScript tasks
- Heavy computations on main thread
- Excessive DOM manipulation
- Large re-renders

**Solutions**:
1. Use React.memo() for expensive components
2. Debounce/throttle event handlers
3. Move computations to web workers
4. Use virtual scrolling for long lists
5. Optimize React renders with useMemo/useCallback

### High CLS

**Common Causes**:
- Images without dimensions
- Web fonts loading
- Dynamic content insertion
- Ads or embeds

**Solutions**:
1. Set explicit width/height on images
2. Use font-display: swap
3. Reserve space for dynamic content
4. Use aspect-ratio CSS property
5. Preload fonts

### Slow API Responses

**Common Causes**:
- Database query inefficiency
- Missing indexes
- N+1 queries
- No caching

**Solutions**:
1. Add database indexes
2. Use query optimization
3. Implement caching layer (Redis)
4. Use database connection pooling
5. Optimize API payload size

## Resources

- [Web Vitals Documentation](https://web.dev/vitals/)
- [Vercel Analytics Guide](https://vercel.com/docs/analytics)
- [Next.js Performance](https://nextjs.org/docs/pages/building-your-application/optimizing)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
- [Web.dev Performance](https://web.dev/performance/)

## Support

For performance issues:
- Email: performance@kitchenoftech.com
- Documentation: `/docs/performance`
- Slack: #performance channel
