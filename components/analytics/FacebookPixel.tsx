'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface FacebookPixelProps {
  pixelId: string;
}

export function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      // Track page views
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}

// Facebook Pixel event tracking helper
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

// Standard Facebook Pixel events
export const FacebookEvents = {
  // Page events
  PageView: () => trackEvent('PageView'),
  ViewContent: (params?: { content_name?: string; content_category?: string; value?: number }) =>
    trackEvent('ViewContent', params),
  
  // Commerce events
  AddToCart: (params?: { content_name?: string; content_ids?: string[]; value?: number; currency?: string }) =>
    trackEvent('AddToCart', params),
  InitiateCheckout: (params?: { value?: number; currency?: string; num_items?: number }) =>
    trackEvent('InitiateCheckout', params),
  Purchase: (params: { value: number; currency: string; content_ids?: string[] }) =>
    trackEvent('Purchase', params),
  
  // Lead events
  Lead: (params?: { content_name?: string; value?: number; currency?: string }) =>
    trackEvent('Lead', params),
  CompleteRegistration: (params?: { content_name?: string; value?: number; currency?: string }) =>
    trackEvent('CompleteRegistration', params),
  Contact: (params?: { content_name?: string }) =>
    trackEvent('Contact', params),
  
  // Custom events
  ScheduleMeeting: (params?: { content_name?: string; value?: number }) =>
    trackEvent('Schedule', params),
  SubmitApplication: (params?: { content_name?: string }) =>
    trackEvent('SubmitApplication', params),
};

// TypeScript declaration
declare global {
  interface Window {
    fbq: (action: string, event: string, params?: Record<string, unknown>) => void;
    _fbq: (action: string, event: string, params?: Record<string, unknown>) => void;
  }
}
