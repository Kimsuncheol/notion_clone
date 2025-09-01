import React from 'react';

// Reusable skeleton components for performance
const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="w-full h-48 bg-gray-300 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-4/6" />
      </div>
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="flex justify-between items-center p-2 animate-pulse">
    <div className="flex space-x-6">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-20" />
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-16" />
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-12" />
    </div>
    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-700 rounded" />
  </div>
);

export default function TrendingLoading() {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <HeaderSkeleton />
      
      {/* Body Skeleton */}
      <div className="p-4">
        {/* Grid with responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 15 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
