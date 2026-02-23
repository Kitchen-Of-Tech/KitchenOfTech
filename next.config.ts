import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack bundling Sanity packages server-side.
  // Stops the sanity → next-sanity → history (CJS) crash on the server.
  // 'history' is excluded intentionally — Turbopack bundles it client-side fine.
  serverExternalPackages: [
    "sanity",
    "next-sanity",
    "@sanity/client",
    "@sanity/ui",
    "@sanity/icons",
    "@sanity/vision",
    "@sanity/color-input",
    "@sanity/code-input",
    "styled-components",
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    // Temporarily ignore build errors for faster iteration
    ignoreBuildErrors: false,
  },
  // Expose a public flag to the browser to silence Sanity's client-side
  // update/version checks which can cause noisy `Failed to fetch` logs
  // in local/dev environments where the module CDN requests may fail.
  env: {
    NEXT_PUBLIC_SANITY_STUDIO_DISABLE_UPDATE_NOTIFIER:
      process.env.NEXT_PUBLIC_SANITY_STUDIO_DISABLE_UPDATE_NOTIFIER ?? 'true',
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              // Default: only same origin
              "default-src 'self'",
              // Scripts: self, unsafe-inline for Next.js, unsafe-eval for dev, specific CDNs
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.sanity.io https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://connect.facebook.net https://pagead2.googlesyndication.com https://vercel.live",
              // Styles: self, unsafe-inline (required for styled-jsx and Tailwind)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://tagmanager.google.com",
              // Images: self, data URIs (for blur placeholders), Sanity CDN, external image sources
              "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://i.pravatar.cc https://www.google-analytics.com https://ssl.google-analytics.com https://www.googletagmanager.com https://www.facebook.com https://*.facebook.com",
              // Fonts: self, Google Fonts
              "font-src 'self' https://fonts.gstatic.com data:",
              // Connect: self, Sanity API + CDN (incl sanity-cdn.com for auto-update checks), Supabase, Sentry, Analytics, Facebook
              "connect-src 'self' https://cdn.sanity.io https://*.sanity.io https://sanity-cdn.com https://sanity-cdn.work https://*.supabase.co wss://*.supabase.co https://*.sentry.io https://www.google-analytics.com https://ssl.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.facebook.com https://connect.facebook.net https://graph.facebook.com https://vercel.live",
              // Frames: YouTube, Vimeo (for embedded videos if any)
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com https://www.facebook.com https://vercel.live https://td.doubleclick.net",
              // Object and embed: none
              "object-src 'none'",
              // Base URI: self only
              "base-uri 'self'",
              // Form actions: self only
              "form-action 'self'",
              // Frame ancestors: prevent clickjacking
              "frame-ancestors 'none'",
              // Upgrade insecure requests (HTTP -> HTTPS)
              "upgrade-insecure-requests",
            ].join('; '),
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
        ],
      },
    ];
  },
};

export default nextConfig;

