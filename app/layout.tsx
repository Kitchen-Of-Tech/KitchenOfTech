import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/providers/ReactQueryProvider";
import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { TemplateTransition } from "@/components/transitions/TemplateTransition";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kitchen of Tech | Premier IT & Creative Agency",
  description: "Transform your digital presence with cutting-edge web development, mobile apps, UI/UX design, and creative solutions. Expert team delivering innovative technology solutions.",
  keywords: ["IT agency", "creative agency", "web development", "mobile apps", "UI/UX design", "digital marketing"],
  authors: [{ name: "Kitchen of Tech" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kitchenoftech.org",
    siteName: "Kitchen of Tech",
    title: "Kitchen of Tech | Premier IT & Creative Agency",
    description: "Transform your digital presence with cutting-edge technology solutions",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kitchen of Tech | Premier IT & Creative Agency",
    description: "Transform your digital presence with cutting-edge technology solutions",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

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
            <TemplateTransition>
              {children}
            </TemplateTransition>
          </SmoothScrollProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
