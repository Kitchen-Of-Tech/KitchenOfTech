import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManager";
import { TemplateTransition } from "@/components/transitions/TemplateTransition";
import { generateSiteMetadata } from "@/lib/metadata";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AnalyticsProvider } from "@/lib/analytics/provider";
import Script from 'next/script';
import { ConditionalNavbar } from '@/components/layout/ConditionalNavbar';
import { SessionWrapper } from "@/components/providers/SessionWrapper";
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Generate metadata dynamically from Sanity
export async function generateMetadata(): Promise<Metadata> {
  return await generateSiteMetadata();
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";
  
  return (
    <html lang="en" className="lenis" suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-5440986495958060" />
        <meta name="facebook-domain-verification" content="tmpin48vno7ppm67u2fdjgq9h5adjd" />
      </head>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {/* Google Tag Manager (noscript) */}
        {gtmId && <GoogleTagManagerNoScript gtmId={gtmId} />}
        
        {/* Google AdSense - Site Verification & Ownership */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5440986495958060"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        
        {/* Analytics */}
        <Suspense fallback={null}>
          {gtmId && <GoogleTagManager gtmId={gtmId} />}
        </Suspense>
        
        <SessionWrapper>
          <ReactQueryProvider>
            <SmoothScrollProvider>
              <AnalyticsProvider>
                {/* Skip to main content - screen reader / keyboard accessibility */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-semibold"
                >
                  Skip to main content
                </a>
                <ConditionalNavbar />
                <FloatingWhatsApp />
                <TemplateTransition>
                  {children}
                </TemplateTransition>
              </AnalyticsProvider>
            </SmoothScrollProvider>
          </ReactQueryProvider>
        </SessionWrapper>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
