import React from 'react';
import Image from 'next/image';

interface TrendingCardProps {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  onClick?: (id: string) => void;
}

const TrendingCard = React.memo(({ id, title, content, imageUrl, onClick }: TrendingCardProps) => {
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
      onClick={() => onClick?.(id)}
    >
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-700">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
          {content}
        </p>
      </div>
    </div>
  );
});

TrendingCard.displayName = 'TrendingCard';

export default TrendingCard;
