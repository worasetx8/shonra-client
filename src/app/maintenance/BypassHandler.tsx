'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function BypassHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const bypassToken = searchParams.get('bypass');
    
    if (bypassToken) {
      // Set cookie on client side
      document.cookie = `maintenance_bypass=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      
      // Redirect to home without bypass token
      const url = new URL(window.location.href);
      url.searchParams.delete('bypass');
      url.pathname = '/';
      router.replace(url.pathname + url.search);
    }
  }, [searchParams, router]);

  return null;
}


