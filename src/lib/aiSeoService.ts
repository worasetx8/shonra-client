/**
 * Client-side AI SEO Service
 * Provides functions to call AI SEO API endpoints
 */

interface GenerateMetaDescriptionParams {
  content: string;
  type?: string;
  language?: 'th' | 'en';
}

interface GenerateKeywordsParams {
  content: string;
  language?: 'th' | 'en';
  count?: number;
}

interface GenerateAltTextParams {
  imageUrl: string;
  context?: string;
  language?: 'th' | 'en';
}

/**
 * Generate SEO meta description using AI
 */
export async function generateMetaDescription(
  params: GenerateMetaDescriptionParams
): Promise<string | null> {
  try {
    const response = await fetch('/api/ai-seo/meta-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data.success && data.data?.description) {
      return data.data.description;
    }

    return null;
  } catch (error) {
    console.error('Error generating meta description:', error);
    return null;
  }
}

/**
 * Generate keyword suggestions using AI
 */
export async function generateKeywords(
  params: GenerateKeywordsParams
): Promise<string[]> {
  try {
    const response = await fetch('/api/ai-seo/keywords', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data.success && data.data?.keywords) {
      return data.data.keywords;
    }

    return [];
  } catch (error) {
    console.error('Error generating keywords:', error);
    return [];
  }
}

/**
 * Generate image alt text using AI
 */
export async function generateAltText(
  params: GenerateAltTextParams
): Promise<string | null> {
  try {
    const response = await fetch('/api/ai-seo/alt-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    if (data.success && data.data?.altText) {
      return data.data.altText;
    }

    return null;
  } catch (error) {
    console.error('Error generating alt text:', error);
    return null;
  }
}


