# Analytics Implementation Guide

Kitchen of Tech uses a comprehensive analytics strategy to track user behavior, measure performance, and make data-driven decisions.

## Overview

We use multiple analytics providers:

1. **Vercel Analytics** - Web analytics and event tracking
2. **Vercel Speed Insights** - Core Web Vitals monitoring
3. **Google Analytics 4** (Optional) - Detailed user behavior analysis
4. **Custom Analytics API** - Internal event logging and data warehouse integration

## Setup

### Vercel Analytics

Automatically enabled on Vercel deployments. No additional configuration required.

```tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// In your root layout
<Analytics />
<SpeedInsights />
```

### Google Analytics 4 (Optional)

Add your GA4 Measurement ID to `.env.local`:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

The GoogleAnalytics component is already integrated in the root layout.

## Usage

### Automatic Page Tracking

Page views are automatically tracked using the `AnalyticsProvider`:

```tsx
import { AnalyticsProvider } from '@/lib/analytics/provider';

// Wrap your app
<AnalyticsProvider>
  {children}
</AnalyticsProvider>
```

### Manual Event Tracking

Use the `useAnalytics` hook in any client component:

```tsx
'use client';

import { useAnalytics } from '@/lib/analytics/hooks';

export function MyComponent() {
  const { track, trackButtonClick } = useAnalytics();

  const handleClick = () => {
    trackButtonClick('cta-button', {
      section: 'hero',
      label: 'Get Started',
    });
  };

  return <button onClick={handleClick}>Get Started</button>;
}
```

### Service Tracking

Track service-related events:

```tsx
import { useServiceTracking } from '@/lib/analytics/hooks';

const { trackServiceView, trackServiceInquiry, trackCategoryFilter } = useServiceTracking();

// Track service view
trackServiceView(serviceId, serviceName);

// Track inquiry
trackServiceInquiry(serviceId, serviceName);

// Track filter
trackCategoryFilter('web-development');
```

### Course/Education Tracking

Track educational content engagement:

```tsx
import { useCourseTracking } from '@/lib/analytics/hooks';

const {
  trackCourseView,
  trackCourseEnroll,
  trackLessonStart,
  trackLessonComplete,
  trackQuizComplete,
} = useCourseTracking();

// Track course enrollment
trackCourseEnroll(courseId, courseName);

// Track lesson progress
trackLessonStart(courseId, lessonId);
trackLessonComplete(courseId, lessonId);

// Track quiz completion
trackQuizComplete(courseId, quizScore);
```

### Payment Tracking

Track payment events:

```tsx
import { usePaymentTracking } from '@/lib/analytics/hooks';

const { trackPaymentInitiate, trackPaymentSuccess, trackPaymentFailed } = usePaymentTracking();

// Track payment initiation
trackPaymentInitiate(amount, paymentMethod);

// Track success
trackPaymentSuccess(amount, paymentMethod);

// Track failure
trackPaymentFailed(amount, paymentMethod, errorMessage);
```

### Authentication Tracking

Track user authentication:

```tsx
import { useAuthTracking } from '@/lib/analytics/hooks';

const {
  trackLoginSuccess,
  trackLoginFailed,
  trackLogout,
  trackRegisterSuccess,
  trackRegisterFailed,
} = useAuthTracking();

// Track login
trackLoginSuccess(userId);

// Track logout
trackLogout();
```

## Event Types

### Navigation Events
- `page_view` - Automatic page view tracking
- `navigation_click` - Navigation menu clicks

### Service Events
- `service_view` - Service detail page view
- `service_category_filter` - Category filter applied
- `service_inquiry_start` - Inquiry form opened
- `service_inquiry_submit` - Inquiry form submitted

### Portfolio Events
- `portfolio_view` - Portfolio page view
- `portfolio_item_click` - Portfolio item clicked
- `portfolio_filter` - Portfolio filter applied

### Education Events
- `course_view` - Course detail page view
- `course_enroll_start` - Enrollment initiated
- `course_enroll_complete` - Enrollment completed
- `lesson_start` - Lesson started
- `lesson_complete` - Lesson completed
- `quiz_start` - Quiz started
- `quiz_complete` - Quiz completed
- `quiz_score` - Quiz score achieved
- `assignment_submit` - Assignment submitted
- `certificate_download` - Certificate downloaded

### Payment Events
- `payment_initiate` - Payment started
- `payment_method_select` - Payment method selected
- `payment_submit` - Payment submitted
- `payment_success` - Payment completed successfully
- `payment_failed` - Payment failed
- `invoice_download` - Invoice downloaded

### Testimonial Events
- `testimonial_view` - Testimonials page view
- `testimonial_filter` - Testimonial filter applied
- `testimonial_submit_start` - Testimonial form opened
- `testimonial_submit_complete` - Testimonial submitted

### Authentication Events
- `login_attempt` - Login attempted
- `login_success` - Login successful
- `login_failed` - Login failed
- `logout` - User logged out
- `register_attempt` - Registration attempted
- `register_success` - Registration successful
- `register_failed` - Registration failed

### Engagement Events
- `button_click` - Button clicked
- `link_click` - Link clicked
- `video_play` - Video started
- `video_complete` - Video completed
- `download` - File downloaded
- `share` - Content shared
- `search` - Search performed

### Error Events
- `error_occurred` - JavaScript error
- `error_boundary_triggered` - React error boundary triggered

## Event Properties

All events can include additional properties:

```typescript
interface EventProperties {
  // Common
  page?: string;              // Current page path
  section?: string;           // Page section
  category?: string;          // Event category
  label?: string;             // Event label
  value?: number;             // Numeric value
  
  // Service-specific
  service_id?: string;
  service_name?: string;
  service_category?: string;
  
  // Course-specific
  course_id?: string;
  course_name?: string;
  lesson_id?: string;
  quiz_score?: number;
  
  // Payment-specific
  payment_amount?: number;
  payment_method?: string;
  payment_currency?: string;
  
  // User-specific
  user_id?: string;
  user_role?: string;
  
  // Error-specific
  error_message?: string;
  error_code?: string;
  
  // Custom properties
  [key: string]: any;
}
```

## Best Practices

### 1. Track Meaningful Events

Only track events that provide actionable insights:

```tsx
// ✅ Good - Tracks specific user action
trackButtonClick('download-brochure', {
  section: 'services',
  service_id: serviceId,
});

// ❌ Bad - Too generic
trackButtonClick('button-clicked');
```

### 2. Include Context

Always provide context with events:

```tsx
// ✅ Good - Provides context
track('course_enroll_complete', {
  course_id: 'web-dev-101',
  course_name: 'Web Development Fundamentals',
  section: 'education',
  value: 299, // Course price
});

// ❌ Bad - Missing context
track('course_enroll_complete');
```

### 3. Handle Errors Gracefully

Analytics should never break your app:

```tsx
try {
  await submitForm(data);
  trackFormSubmit('contact-form', { success: true });
} catch (error) {
  trackFormError('contact-form', error.message);
  // Handle error...
}
```

### 4. Respect User Privacy

- Never track personally identifiable information (PII) without consent
- Use user IDs, not names or emails, in events
- Respect Do Not Track headers
- Provide opt-out mechanism

### 5. Test in Development

Analytics is logged to console in development mode:

```bash
# Check console for analytics events
[Analytics] Track event: button_click { label: 'cta-button', ... }
```

## Data Retention

- **Vercel Analytics**: 30 days (free tier), longer on paid plans
- **Google Analytics**: 14 months by default (configurable)
- **Custom Analytics**: Configure based on your data warehouse settings

## Viewing Analytics

### Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click "Analytics" tab
4. View real-time and historical data

### Google Analytics

1. Go to [analytics.google.com](https://analytics.google.com)
2. Select your property
3. View reports in left sidebar
4. Create custom reports and dashboards

### Custom Dashboard

Create custom dashboards by querying the `/api/analytics` endpoint data:

```sql
-- Example query (if storing in Supabase)
SELECT
  event_name,
  COUNT(*) as event_count,
  DATE(created_at) as event_date
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name, event_date
ORDER BY event_date DESC, event_count DESC;
```

## Performance Considerations

- Analytics runs asynchronously and doesn't block rendering
- Events are batched to reduce network requests
- Failed analytics calls are logged but don't throw errors
- Analytics scripts are loaded with low priority

## Troubleshooting

### Events not appearing

1. Check console for analytics logs (dev mode)
2. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (for GA4)
3. Check Vercel deployment environment variables
4. Verify network tab shows analytics requests

### High event volume

If you're hitting rate limits:

1. Reduce frequency of repeated events
2. Batch similar events
3. Use sampling for high-frequency events
4. Contact support to increase limits

### Privacy concerns

- Review GDPR/CCPA compliance requirements
- Implement cookie consent banner
- Provide data deletion mechanism
- Document data collection in privacy policy

## Resources

- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Google Analytics 4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)
- [Web Analytics Best Practices](https://web.dev/vitals/)
- [Privacy-Friendly Analytics](https://plausible.io/data-policy)

## Support

For analytics issues:
- Email: analytics@kitchenoftech.com
- Documentation: `/docs/analytics`
- Slack: #analytics channel
