"use client";

import Script from "next/script";

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  );
}

// Custom event tracking functions
export const trackEvent = (eventName: string, eventParams?: Record<string, unknown>) => {
  if (typeof window !== "undefined" && (window as never)["gtag"]) {
    (window as never)["gtag"]("event", eventName, eventParams);
  }
};

export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && (window as never)["gtag"]) {
    (window as never)["gtag"]("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

export const trackButtonClick = (buttonName: string, location?: string) => {
  trackEvent("button_click", {
    button_name: buttonName,
    location: location || "unknown",
  });
};

export const trackFormSubmit = (formName: string, success: boolean) => {
  trackEvent("form_submission", {
    form_name: formName,
    success,
  });
};

export const trackServiceView = (serviceName: string) => {
  trackEvent("service_view", {
    service_name: serviceName,
  });
};

export const trackBlogPostView = (postTitle: string, category?: string) => {
  trackEvent("blog_post_view", {
    post_title: postTitle,
    category: category || "uncategorized",
  });
};
