/**
 * Client-side API utilities for making requests directly to backend
 * Use these functions in React components (client-side only)
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002';

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Make a GET request to backend API from client-side
 */
export async function fetchFromBackend(endpoint: string, options: FetchOptions = {}) {
  const { params, ...fetchOptions } = options;
  
  let url = `${BACKEND_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch settings from backend
 */
export async function fetchSettings() {
  return fetchFromBackend('/api/settings');
}

/**
 * Fetch categories from backend
 */
export async function fetchCategories() {
  return fetchFromBackend('/api/categories/public');
}

/**
 * Fetch tags from backend
 */
export async function fetchTags() {
  return fetchFromBackend('/api/tags/public');
}

/**
 * Fetch products from backend
 */
export async function fetchProducts(params: {
  page?: string;
  limit?: string;
  category_id?: string;
  tag_id?: string;
  search?: string;
  status?: string;
}) {
  return fetchFromBackend('/api/products/public', { params });
}

/**
 * Fetch flash sale products
 */
export async function fetchFlashSaleProducts(params: {
  page?: string;
  limit?: string;
}) {
  return fetchFromBackend('/api/products/flash-sale', { params });
}

/**
 * Fetch banners by position
 */
export async function fetchBanners(positionName: string) {
  return fetchFromBackend(`/api/banners/public/${encodeURIComponent(positionName)}`);
}

/**
 * Search Shopee products from backend
 */
export async function searchShopeeProducts(params: {
  page?: string;
  search?: string;
  commissionRate?: string;
  ratingStar?: string;
}) {
  return fetchFromBackend('/api/shopee/search', { params });
}
