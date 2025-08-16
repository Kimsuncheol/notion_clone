import React from 'react';

// Reusable skeleton components for performance
const CardSkeleton = () => (
  <div className="rounded-lg shadow-md overflow-hidden animate-pulse bg-[#262626]">
    <div className="w-full h-48 bg-gray-600" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-600 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-600 rounded" />
        <div className="h-3 bg-gray-600 rounded w-5/6" />
        <div className="h-3 bg-gray-600 rounded w-4/6" />
      </div>
    </div>
  </div>
);

const HeaderSkeleton = () => (
  <div className="flex justify-between items-center px-2 py-3 animate-pulse bg-[#262626]">
    <div className="h-8 bg-gray-600 rounded w-48" />
    <div className="flex items-center gap-4">
      <div className="w-6 h-6 bg-gray-600 rounded" />
      <div className="w-6 h-6 bg-gray-600 rounded" />
      <div className="w-20 h-8 bg-gray-600 rounded-full" />
      <div className="w-10 h-10 bg-gray-600 rounded-full" />
    </div>
  </div>
);

const TabbarSkeleton = () => (
  <div className="flex justify-between items-center px-2 py-3 animate-pulse bg-[#262626]">
    <div className="h-8 bg-gray-600 rounded w-48" />
  </div>
);

export default function RecentLoading() {
  return (
    <div className="w-full">
      {/* Header Skeleton */}
      <HeaderSkeleton />
      <TabbarSkeleton />
      {/* Body Skeleton */}
      <div className="px-2 py-4">
        {/* Grid with responsive columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 15 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
