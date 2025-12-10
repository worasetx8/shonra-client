'use client';

import React from 'react';
import { Home, ArrowLeft, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const handleGoBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-100 rounded-full opacity-20"></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* 404 Animation */}
        <div className="mb-8">
          <div className="relative">
            <h1 className="text-8xl md:text-9xl font-bold text-red-600 opacity-20 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-red-600 rounded-full flex items-center justify-center animate-bounce">
                <Search className="w-8 h-8 md:w-12 md:h-12 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Oops! Page Not Found
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-2">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <p className="text-gray-500 text-sm">
            Don't worry, let's get you back to shopping!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Action - Go Home */}
          <Link 
            href="/"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
          >
            <Home size={20} />
            <span>Back to SHONRA</span>
          </Link>

          {/* Secondary Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoBack}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              <span>Go Back</span>
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg border border-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Popular Pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link 
              href="/backoffice"
              className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Admin Panel
            </Link>
            <Link 
              href="/backoffice/saved"
              className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Saved Products
            </Link>
            <Link 
              href="/test-api"
              className="px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              API Test
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm font-medium">SHONRA</span>
          </div>
        </div>
      </div>
    </div>
  );
}