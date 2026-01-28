'use client';

import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics, EventName, EventProperties } from './index';

/**
 * Hook to automatically track page views on navigation
 */
export function usePageTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname) {
      analytics.pageView({
        page: pathname,
        search: searchParams?.toString(),
      });
    }
  }, [pathname, searchParams]);
}

/**
 * Hook to get analytics tracking functions
 */
export function useAnalytics() {
  const track = useCallback((eventName: EventName, properties?: EventProperties) => {
    analytics.track(eventName, properties);
  }, []);

  const trackButtonClick = useCallback((buttonName: string, properties?: EventProperties) => {
    analytics.buttonClick(buttonName, properties);
  }, []);

  const trackLinkClick = useCallback((href: string, properties?: EventProperties) => {
    analytics.linkClick(href, properties);
  }, []);

  const trackFormSubmit = useCallback((formName: string, properties?: EventProperties) => {
    analytics.formSubmit(formName, properties);
  }, []);

  const trackFormError = useCallback((formName: string, errorMessage: string, properties?: EventProperties) => {
    analytics.formError(formName, errorMessage, properties);
  }, []);

  const trackSearch = useCallback((query: string, properties?: EventProperties) => {
    analytics.search(query, properties);
  }, []);

  const trackVideoPlay = useCallback((videoName: string, properties?: EventProperties) => {
    analytics.videoPlay(videoName, properties);
  }, []);

  const trackDownload = useCallback((fileName: string, properties?: EventProperties) => {
    analytics.download(fileName, properties);
  }, []);

  const trackShare = useCallback((platform: string, contentUrl: string, properties?: EventProperties) => {
    analytics.share(platform, contentUrl, properties);
  }, []);

  const trackError = useCallback((errorMessage: string, properties?: EventProperties) => {
    analytics.error(errorMessage, properties);
  }, []);

  return {
    track,
    trackButtonClick,
    trackLinkClick,
    trackFormSubmit,
    trackFormError,
    trackSearch,
    trackVideoPlay,
    trackDownload,
    trackShare,
    trackError,
    setUserId: analytics.setUserId.bind(analytics),
    clearUserId: analytics.clearUserId.bind(analytics),
  };
}

/**
 * Hook to track service views
 */
export function useServiceTracking() {
  const { track } = useAnalytics();

  const trackServiceView = useCallback((serviceId: string, serviceName: string) => {
    track('service_view', {
      service_id: serviceId,
      service_name: serviceName,
    });
  }, [track]);

  const trackServiceInquiry = useCallback((serviceId: string, serviceName: string) => {
    track('service_inquiry_start', {
      service_id: serviceId,
      service_name: serviceName,
    });
  }, [track]);

  const trackCategoryFilter = useCallback((category: string) => {
    track('service_category_filter', {
      category,
    });
  }, [track]);

  return {
    trackServiceView,
    trackServiceInquiry,
    trackCategoryFilter,
  };
}

/**
 * Hook to track course/education events
 */
export function useCourseTracking() {
  const { track } = useAnalytics();

  const trackCourseView = useCallback((courseId: string, courseName: string) => {
    track('course_view', {
      course_id: courseId,
      course_name: courseName,
    });
  }, [track]);

  const trackCourseEnroll = useCallback((courseId: string, courseName: string) => {
    track('course_enroll_complete', {
      course_id: courseId,
      course_name: courseName,
    });
  }, [track]);

  const trackLessonStart = useCallback((courseId: string, lessonId: string) => {
    track('lesson_start', {
      course_id: courseId,
      lesson_id: lessonId,
    });
  }, [track]);

  const trackLessonComplete = useCallback((courseId: string, lessonId: string) => {
    track('lesson_complete', {
      course_id: courseId,
      lesson_id: lessonId,
    });
  }, [track]);

  const trackQuizComplete = useCallback((courseId: string, quizScore: number) => {
    track('quiz_complete', {
      course_id: courseId,
      quiz_score: quizScore,
    });
  }, [track]);

  return {
    trackCourseView,
    trackCourseEnroll,
    trackLessonStart,
    trackLessonComplete,
    trackQuizComplete,
  };
}

/**
 * Hook to track payment events
 */
export function usePaymentTracking() {
  const { track } = useAnalytics();

  const trackPaymentInitiate = useCallback((amount: number, method: string) => {
    track('payment_initiate', {
      payment_amount: amount,
      payment_method: method,
    });
  }, [track]);

  const trackPaymentSuccess = useCallback((amount: number, method: string) => {
    track('payment_success', {
      payment_amount: amount,
      payment_method: method,
      value: amount,
    });
  }, [track]);

  const trackPaymentFailed = useCallback((amount: number, method: string, errorMessage: string) => {
    track('payment_failed', {
      payment_amount: amount,
      payment_method: method,
      error_message: errorMessage,
    });
  }, [track]);

  return {
    trackPaymentInitiate,
    trackPaymentSuccess,
    trackPaymentFailed,
  };
}

/**
 * Hook to track authentication events
 */
export function useAuthTracking() {
  const { track, setUserId, clearUserId } = useAnalytics();

  const trackLoginSuccess = useCallback((userId: string) => {
    setUserId(userId);
    track('login_success', {
      user_id: userId,
    });
  }, [track, setUserId]);

  const trackLoginFailed = useCallback((errorMessage: string) => {
    track('login_failed', {
      error_message: errorMessage,
    });
  }, [track]);

  const trackLogout = useCallback(() => {
    track('logout');
    clearUserId();
  }, [track, clearUserId]);

  const trackRegisterSuccess = useCallback((userId: string) => {
    setUserId(userId);
    track('register_success', {
      user_id: userId,
    });
  }, [track, setUserId]);

  const trackRegisterFailed = useCallback((errorMessage: string) => {
    track('register_failed', {
      error_message: errorMessage,
    });
  }, [track]);

  return {
    trackLoginSuccess,
    trackLoginFailed,
    trackLogout,
    trackRegisterSuccess,
    trackRegisterFailed,
  };
}
