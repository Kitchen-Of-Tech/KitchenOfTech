import { client } from '@/lib/sanity/client';
import { SITE_SETTINGS_QUERY } from '@/lib/sanity/queries';
import type { SiteSettings } from '@/types';
import type { Metadata } from 'next';
import { urlFor } from '@/lib/sanity/client';

/**
 * Generate dynamic metadata from Sanity site settings
 * Fallback to hardcoded values if Sanity data is not available
 */
export async function generateSiteMetadata(): Promise<Metadata> {
  try {
    const siteSettings = await client.fetch<SiteSettings>(SITE_SETTINGS_QUERY);

    if (!siteSettings) {
      return getDefaultMetadata();
    }

    // Build favicon URL if available
    let faviconUrl = '/favicon.ico';
    if (siteSettings.favicon?.asset) {
      faviconUrl = urlFor(siteSettings.favicon as any).width(32).height(32).url();
    }

    // Build OG image URL if available
    let ogImageUrl = undefined;
    if (siteSettings.seo?.ogImage?.asset) {
      ogImageUrl = urlFor(siteSettings.seo.ogImage as any).width(1200).height(630).url();
    }

    return {
      title: siteSettings.seo?.metaTitle || siteSettings.siteName || 'Kitchen of Tech',
      description: siteSettings.seo?.metaDescription || siteSettings.siteDescription || 'Transform your digital presence with cutting-edge technology solutions',
      keywords: siteSettings.seo?.keywords || ['IT agency', 'web development', 'mobile apps', 'UI/UX design'],
      authors: [{ name: siteSettings.siteName || 'Kitchen of Tech' }],
      icons: {
        icon: faviconUrl,
        shortcut: faviconUrl,
        apple: faviconUrl,
      },
      verification: {
        google: 'ca-pub-5440986495958060',
      },
      other: {
        'google-adsense-account': 'ca-pub-5440986495958060',
      },
      openGraph: {
        type: 'website',
        locale: 'en_US',
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://kitchenoftech.org',
        siteName: siteSettings.siteName || 'Kitchen of Tech',
        title: siteSettings.seo?.metaTitle || siteSettings.siteName || 'Kitchen of Tech',
        description: siteSettings.seo?.metaDescription || siteSettings.siteDescription || '',
        ...(ogImageUrl && {
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: siteSettings.siteName || 'Kitchen of Tech',
            },
          ],
        }),
      },
      twitter: {
        card: 'summary_large_image',
        title: siteSettings.seo?.metaTitle || siteSettings.siteName || 'Kitchen of Tech',
        description: siteSettings.seo?.metaDescription || siteSettings.siteDescription || '',
        ...(ogImageUrl && {
          images: [ogImageUrl],
        }),
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
  } catch (error) {
    console.error('Error fetching site settings for metadata:', error);
    return getDefaultMetadata();
  }
}

/**
 * Fallback metadata when Sanity data is unavailable
 */
function getDefaultMetadata(): Metadata {
  return {
    title: 'Kitchen of Tech | Premier IT & Creative Agency',
    description: 'Transform your digital presence with cutting-edge web development, mobile apps, UI/UX design, and creative solutions. Expert team delivering innovative technology solutions.',
    keywords: ['IT agency', 'creative agency', 'web development', 'mobile apps', 'UI/UX design', 'digital marketing'],
    authors: [{ name: 'Kitchen of Tech' }],
    verification: {
      google: 'ca-pub-5440986495958060',
    },
    other: {
      'google-adsense-account': 'ca-pub-5440986495958060',
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: 'https://kitchenoftech.org',
      siteName: 'Kitchen of Tech',
      title: 'Kitchen of Tech | Premier IT & Creative Agency',
      description: 'Transform your digital presence with cutting-edge technology solutions',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Kitchen of Tech | Premier IT & Creative Agency',
      description: 'Transform your digital presence with cutting-edge technology solutions',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
