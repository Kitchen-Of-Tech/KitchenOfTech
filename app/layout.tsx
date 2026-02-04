import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { GoogleTagManager, GoogleTagManagerNoScript } from "@/components/analytics/GoogleTagManager";
import { FacebookPixel } from "@/components/analytics/FacebookPixel";
import { TemplateTransition } from "@/components/transitions/TemplateTransition";
import { generateSiteMetadata } from "@/lib/metadata";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AnalyticsProvider } from "@/lib/analytics/provider";
import Script from 'next/script';
import { ConditionalNavbar } from '@/components/layout/ConditionalNavbar';
import { SessionWrapper } from "@/components/providers/SessionWrapper";

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
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";
  const facebookPixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || "";
  
  return (
    <html lang="en" className="lenis">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5440986495958060" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Google Tag Manager (noscript) */}
        {gtmId && <GoogleTagManagerNoScript gtmId={gtmId} />}
        
        {/* Google AdSense - Site Verification & Ownership - Must load before interactive */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5440986495958060"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        
        {/* Analytics */}
        {measurementId && <GoogleAnalytics measurementId={measurementId} />}
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {facebookPixelId && <FacebookPixel pixelId={facebookPixelId} />}
        
        <SessionWrapper>
          <ReactQueryProvider>
            <SmoothScrollProvider>
              <AnalyticsProvider>
                <ConditionalNavbar />
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
