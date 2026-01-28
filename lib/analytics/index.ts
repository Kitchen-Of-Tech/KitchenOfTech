/**
 * Analytics utility for tracking user events and behavior
 * Supports multiple analytics providers (Vercel, Google Analytics, custom)
 */

import { track as vercelTrack } from '@vercel/analytics';

export type EventName =
  // Navigation Events
  | 'page_view'
  | 'navigation_click'
  
  // Service Events
  | 'service_view'
  | 'service_category_filter'
  | 'service_inquiry_start'
  | 'service_inquiry_submit'
  
  // Portfolio Events
  | 'portfolio_view'
  | 'portfolio_item_click'
  | 'portfolio_filter'
  
  // Education Events
  | 'course_view'
  | 'course_enroll_start'
  | 'course_enroll_complete'
  | 'lesson_start'
  | 'lesson_complete'
  | 'quiz_start'
  | 'quiz_complete'
  | 'quiz_score'
  | 'assignment_submit'
  | 'certificate_download'
  
  // Team Events
  | 'team_member_view'
  | 'team_filter'
  
  // Blog Events
  | 'blog_post_view'
  | 'blog_category_filter'
  | 'blog_search'
  
  // Contact Events
  | 'contact_form_view'
  | 'contact_form_submit'
  | 'contact_form_error'
  
  // Payment Events
  | 'payment_initiate'
  | 'payment_method_select'
  | 'payment_submit'
  | 'payment_success'
  | 'payment_failed'
  | 'invoice_download'
  
  // Testimonial Events
  | 'testimonial_view'
  | 'testimonial_filter'
  | 'testimonial_submit_start'
  | 'testimonial_submit_complete'
  
  // Authentication Events
  | 'login_attempt'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'register_attempt'
  | 'register_success'
  | 'register_failed'
  
  // User Engagement
  | 'button_click'
  | 'link_click'
  | 'video_play'
  | 'video_complete'
  | 'download'
  | 'share'
  | 'search'
  
  // Error Events
  | 'error_occurred'
  | 'error_boundary_triggered';

export interface EventProperties {
  // Common properties
  page?: string;
  section?: string;
  category?: string;
  label?: string;
  value?: number;
  
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
  
  // Generic properties
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  private enabled: boolean;
  private debug: boolean;
  private userId?: string;
  private sessionId: string;

  constructor() {
    this.enabled = typeof window !== 'undefined';
    this.debug = process.env.NODE_ENV === 'development';
    this.sessionId = this.generateSessionId();
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set the current user ID for analytics
   */
  public setUserId(userId: string) {
    this.userId = userId;
    this.log('User ID set:', userId);
  }

  /**
   * Clear the current user ID (on logout)
   */
  public clearUserId() {
    this.userId = undefined;
    this.log('User ID cleared');
  }

  /**
   * Track an event
   */
  public track(eventName: EventName, properties?: EventProperties) {
    if (!this.enabled) {
      return;
    }

    const eventData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      user_id: this.userId,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
      referrer: typeof document !== 'undefined' ? document.referrer : undefined,
      ...properties,
    };

    // Log in development
    if (this.debug) {
      this.log('Track event:', eventName, eventData);
    }

    // Send to Vercel Analytics
    try {
      vercelTrack(eventName, eventData);
    } catch (error) {
      console.error('Vercel Analytics error:', error);
    }

    // Send to custom analytics endpoint (if needed)
    this.sendToCustomEndpoint(eventData);

    // Send to Google Analytics (if configured)
    this.sendToGoogleAnalytics(eventName, eventData);
  }

  /**
   * Track a page view
   */
  public pageView(properties?: EventProperties) {
    if (typeof window === 'undefined') {
      return;
    }

    this.track('page_view', {
      page: window.location.pathname,
      title: document.title,
      ...properties,
    });
  }

  /**
   * Track a button click
   */
  public buttonClick(buttonName: string, properties?: EventProperties) {
    this.track('button_click', {
      label: buttonName,
      ...properties,
    });
  }

  /**
   * Track a link click
   */
  public linkClick(href: string, properties?: EventProperties) {
    this.track('link_click', {
      label: href,
      ...properties,
    });
  }

  /**
   * Track an error
   */
  public error(errorMessage: string, properties?: EventProperties) {
    this.track('error_occurred', {
      error_message: errorMessage,
      ...properties,
    });
  }

  /**
   * Send event to custom analytics endpoint
   */
  private async sendToCustomEndpoint(eventData: any) {
    try {
      // Only send in production
      if (process.env.NODE_ENV !== 'production') {
        return;
      }

      await fetch('/api/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
    } catch (error) {
      // Fail silently - don't block the user experience
      if (this.debug) {
        console.error('Custom analytics error:', error);
      }
    }
  }

  /**
   * Send to Google Analytics (if gtag is available)
   */
  private sendToGoogleAnalytics(eventName: string, eventData: any) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, eventData);
    }
  }

  /**
   * Log messages (only in development)
   */
  private log(...args: any[]) {
    if (this.debug) {
      console.log('[Analytics]', ...args);
    }
  }

  /**
   * Track form submission
   */
  public formSubmit(formName: string, properties?: EventProperties) {
    this.track('contact_form_submit', {
      label: formName,
      ...properties,
    });
  }

  /**
   * Track form error
   */
  public formError(formName: string, errorMessage: string, properties?: EventProperties) {
    this.track('contact_form_error', {
      label: formName,
      error_message: errorMessage,
      ...properties,
    });
  }

  /**
   * Track search
   */
  public search(query: string, properties?: EventProperties) {
    this.track('search', {
      label: query,
      ...properties,
    });
  }

  /**
   * Track video play
   */
  public videoPlay(videoName: string, properties?: EventProperties) {
    this.track('video_play', {
      label: videoName,
      ...properties,
    });
  }

  /**
   * Track download
   */
  public download(fileName: string, properties?: EventProperties) {
    this.track('download', {
      label: fileName,
      ...properties,
    });
  }

  /**
   * Track share action
   */
  public share(platform: string, contentUrl: string, properties?: EventProperties) {
    this.track('share', {
      label: platform,
      value: 1,
      content_url: contentUrl,
      ...properties,
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Export convenience functions
export const track = analytics.track.bind(analytics);
export const pageView = analytics.pageView.bind(analytics);
export const setUserId = analytics.setUserId.bind(analytics);
export const clearUserId = analytics.clearUserId.bind(analytics);
