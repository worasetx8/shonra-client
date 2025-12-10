'use client';

import React from 'react';

interface LogoImageProps {
  src: string;
  alt: string;
}

export default function LogoImage({ src, alt }: LogoImageProps) {
  const [imageError, setImageError] = React.useState(false);

  if (imageError) {
    return (
      <div className="w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
        <span className="text-4xl font-bold text-zinc-500">M</span>
      </div>
    );
  }

  return (
    <img 
      src={src.startsWith('http') ? src : `${process.env.NEXT_PUBLIC_BACKEND_URL || ''}${src}`}
      alt={alt} 
      className="w-32 h-32 object-contain"
      onError={() => setImageError(true)}
    />
  );
}


