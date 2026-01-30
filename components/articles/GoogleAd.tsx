"use client";

import { useEffect } from 'react';

interface GoogleAdProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  fullWidthResponsive?: boolean;
  className?: string;
}

/**
 * Google AdSense Component
 * ONLY used in Articles-related pages (/articles, /articles/[slug], /articles/submit)
 */
export default function GoogleAd({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}: GoogleAdProps) {
  useEffect(() => {
    try {
      // @ts-expect-error - AdSense global variable
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // Don't render if no AdSense client ID is configured
  if (!process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID) {
    return null;
  }

  return (
    <div className={`google-ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

// Predefined ad slot configurations for different positions
export const AdSlots = {
  ARTICLE_TOP: '1234567890', // Top of article page (replace with actual slot ID)
  ARTICLE_SIDEBAR: '1234567891', // Sidebar on article page
  ARTICLE_BOTTOM: '1234567892', // Bottom of article page
  ARTICLE_IN_CONTENT: '1234567893', // Within article content
  ARTICLES_LIST_TOP: '1234567894', // Top of articles listing
  ARTICLES_LIST_SIDEBAR: '1234567895', // Sidebar on articles listing
  SUBMIT_PAGE: '1234567896', // Article submission page
};
