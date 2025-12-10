import React, { Suspense } from 'react';
import Link from 'next/link';
import LogoImage from './LogoImage';
import BypassHandler from './BypassHandler';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

async function getSettings() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/settings`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return null;
  }
}

export default async function MaintenancePage() {
  const settings = await getSettings();

  return (
    <>
      <Suspense fallback={null}>
        <BypassHandler />
      </Suspense>
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          {settings?.logo_client_url || settings?.logo_url ? (
            <LogoImage 
              src={settings.logo_client_url || settings.logo_url}
              alt={settings.website_name || 'Logo'}
            />
          ) : (
            <div className="w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
              <span className="text-4xl font-bold text-zinc-500">M</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
            Under Maintenance
          </h1>
          <p className="text-zinc-400 text-lg">
            We are currently updating our website to give you a better experience. 
            Please come back later.
          </p>
        </div>

        {/* Website Name */}
        {settings?.website_name && (
          <div className="pt-8 border-t border-zinc-900">
            <p className="text-zinc-600 text-sm">
              &copy; {new Date().getFullYear()} {settings.website_name}. All rights reserved.
            </p>
          </div>
        )}
        
        {/* Admin Login Link (Hidden/Subtle) */}
        <div className="pt-4">
            <Link href="/backoffice/login" className="text-zinc-800 hover:text-zinc-600 text-xs transition-colors">
                Admin Login
            </Link>
        </div>
      </div>
    </div>
    </>
  );
}

