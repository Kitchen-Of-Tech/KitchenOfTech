import Script from 'next/script';
import { Navbar } from '@/components/layout/Navbar';

/**
 * Articles Layout - ONLY used for /articles routes
 * This ensures Google AdSense loads ONLY on articles pages, not site-wide
 */
export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

  return (
    <>
      <Navbar />
      {/* Google AdSense Script - ONLY loads for articles pages */}
      {adsenseId && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      {children}
    </>
  );
}
