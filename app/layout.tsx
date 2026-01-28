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
      <body className={`${inter.variable} antialiased`}>
        {measurementId && <GoogleAnalytics measurementId={measurementId} />}
        <ReactQueryProvider>
          <SmoothScrollProvider>
            <AnalyticsProvider>
              <TemplateTransition>
                {children}
              </TemplateTransition>
            </AnalyticsProvider>
          </SmoothScrollProvider>
        </ReactQueryProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
