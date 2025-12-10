import { Providers } from './providers';
import './globals.css';
import type { Metadata } from 'next';
import { getBackendUrl } from '@/lib/api-utils';

const DEFAULT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://shonra.com';
const DEFAULT_SITE_NAME = 'SHONRA';
const DEFAULT_TITLE = 'SHONRA - Shopee Affiliate Platform';
const DEFAULT_DESCRIPTION = 'Discover amazing deals and earn commissions with SHONRA. Find the best products from Shopee with exclusive discounts and flash sales.';
const DEFAULT_KEYWORDS = ['Shopee', 'Affiliate', 'E-commerce', 'Flash Sale', 'Deals', 'Discount', 'Thailand', 'สินค้า', 'โปรโมชั่น', 'ลดราคา'];

/**
 * Fetch SEO settings from API (with fallback to defaults)
 * Note: This runs at build time and request time (with caching)
 */
async function getSEOSettings() {
  try {
    const BACKEND_URL = getBackendUrl();
    const response = await fetch(`${BACKEND_URL}/api/settings`, {
      next: { revalidate: 60, tags: ['settings'] }, // Cache for 60 seconds
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data) {
        const settings = data.data;
        return {
          siteUrl: settings.site_url || DEFAULT_SITE_URL,
          siteName: DEFAULT_SITE_NAME,
          title: DEFAULT_TITLE,
          description: settings.meta_description || DEFAULT_DESCRIPTION,
          keywords: settings.meta_keywords 
            ? settings.meta_keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0)
            : DEFAULT_KEYWORDS,
          titleTemplate: settings.meta_title_template || `%s | ${DEFAULT_SITE_NAME}`,
          ogImage: settings.og_image_url || `${DEFAULT_SITE_URL}/og-image.jpg`,
          ogTitle: settings.og_title || DEFAULT_TITLE,
          ogDescription: settings.og_description || settings.meta_description || DEFAULT_DESCRIPTION,
          twitterHandle: settings.twitter_handle || '@shonra',
          googleVerification: settings.google_verification_code,
          bingVerification: settings.bing_verification_code,
          canonicalUrl: settings.canonical_url || settings.site_url || DEFAULT_SITE_URL,
          robotsMeta: settings.robots_meta || 'index, follow',
        };
      }
    }
  } catch (error) {
    console.warn('Failed to fetch SEO settings from API, using defaults:', error);
  }

  // Fallback to defaults
  return {
    siteUrl: DEFAULT_SITE_URL,
    siteName: DEFAULT_SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    titleTemplate: `%s | ${DEFAULT_SITE_NAME}`,
    ogImage: `${DEFAULT_SITE_URL}/og-image.jpg`,
    ogTitle: DEFAULT_TITLE,
    ogDescription: DEFAULT_DESCRIPTION,
    twitterHandle: '@shonra',
    googleVerification: undefined,
    bingVerification: undefined,
    canonicalUrl: DEFAULT_SITE_URL,
    robotsMeta: 'index, follow',
  };
}

// Generate metadata dynamically from API
export async function generateMetadata(): Promise<Metadata> {
  const seoSettings = await getSEOSettings();

  // Parse robots meta
  const robotsIndex = seoSettings.robotsMeta.includes('index');
  const robotsFollow = seoSettings.robotsMeta.includes('follow');
  const robotsNoIndex = seoSettings.robotsMeta.includes('noindex');
  const robotsNoFollow = seoSettings.robotsMeta.includes('nofollow');

  return {
    metadataBase: new URL(seoSettings.siteUrl),
    title: {
      default: seoSettings.title,
      template: seoSettings.titleTemplate,
    },
    description: seoSettings.description,
    keywords: seoSettings.keywords,
    authors: [{ name: seoSettings.siteName }],
    creator: seoSettings.siteName,
    publisher: seoSettings.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'th_TH',
      url: seoSettings.siteUrl,
      siteName: seoSettings.siteName,
      title: seoSettings.ogTitle,
      description: seoSettings.ogDescription,
      images: [
        {
          url: seoSettings.ogImage.startsWith('http') 
            ? seoSettings.ogImage 
            : `${seoSettings.siteUrl}${seoSettings.ogImage.startsWith('/') ? '' : '/'}${seoSettings.ogImage}`,
          width: 1200,
          height: 630,
          alt: seoSettings.siteName,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoSettings.ogTitle,
      description: seoSettings.ogDescription,
      images: [seoSettings.ogImage.startsWith('http') 
        ? seoSettings.ogImage 
        : `${seoSettings.siteUrl}${seoSettings.ogImage.startsWith('/') ? '' : '/'}${seoSettings.ogImage}`],
      creator: seoSettings.twitterHandle,
    },
    robots: {
      index: robotsIndex && !robotsNoIndex,
      follow: robotsFollow && !robotsNoFollow,
      googleBot: {
        index: robotsIndex && !robotsNoIndex,
        follow: robotsFollow && !robotsNoFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },
    verification: {
      ...(seoSettings.googleVerification && { google: seoSettings.googleVerification }),
      ...(seoSettings.bingVerification && { other: { 'msvalidate.01': seoSettings.bingVerification } }),
    },
    alternates: {
      canonical: seoSettings.canonicalUrl,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cardo:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
