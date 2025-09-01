import React from 'react';

const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border dark:border-gray-700 animate-pulse">
    <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8" />
        </div>
      </div>
    </div>
  </div>
);

export default function ReadLoading() {
  return (
    <div className="px-2 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}