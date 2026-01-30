import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { TemplateTransition } from "@/components/transitions/TemplateTransition";
import { generateSiteMetadata } from "@/lib/metadata";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { AnalyticsProvider } from "@/lib/analytics/provider";
import Script from 'next/script';
import { Navbar } from '@/components/layout/Navbar';
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
  
  return (
    <html lang="en" className="lenis">
      <head>
        <meta name="google-adsense-account" content="ca-pub-5440986495958060" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {/* Google AdSense - Site Verification & Ownership - Must load before interactive */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5440986495958060"
          crossOrigin="anonymous"
          strategy="beforeInteractive"
        />
        
        {measurementId && <GoogleAnalytics measurementId={measurementId} />}
        <SessionWrapper>
          <ReactQueryProvider>
            <SmoothScrollProvider>
              <AnalyticsProvider>
                <Navbar />
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
