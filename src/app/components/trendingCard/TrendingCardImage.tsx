'use client';

import Image from 'next/image';
import React from 'react';

interface TrendingCardImageProps {
  title: string;
  imageUrl?: string;
  height: number;
}

const TrendingCardImage: React.FC<TrendingCardImageProps> = ({ title, imageUrl, height }) => {
  return (
    <div className="relative w-full bg-gray-200 dark:bg-gray-700" style={{ height }}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          style={{ height: '100%' }}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw , (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-gray-500">
          <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default TrendingCardImage;
