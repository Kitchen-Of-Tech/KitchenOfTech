'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

interface GoogleTagManagerProps {
  gtmId: string;
}

export function GoogleTagManager({ gtmId }: GoogleTagManagerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      // Track page views
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'pageview',
        page: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
      });
    }
  }, [pathname, searchParams]);

  return (
    <>
      {/* Google Tag Manager Script */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `,
        }}
      />
    </>
  );
}

// GTM NoScript fallback for <body>
export function GoogleTagManagerNoScript({ gtmId }: GoogleTagManagerProps) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

// TypeScript declaration for dataLayer
declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}
