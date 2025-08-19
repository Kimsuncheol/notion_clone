import React from 'react'

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* Header Skeleton */}
      <div className="bg-gray-900 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-16 h-8 bg-gray-700 rounded mx-auto animate-pulse"></div>
          </div>
          
          {/* Search Bar Skeleton */}
          <div className="relative max-w-2xl mx-auto">
            <div className="w-full h-14 bg-gray-800 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Count Skeleton */}
        <div className="mb-6">
          <div className="w-64 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Search Results Skeleton */}
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
              {/* Author Info Skeleton */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>

              <div className="flex gap-6">
                {/* Content Skeleton */}
                <div className="flex-1">
                  {/* Title Skeleton */}
                  <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>

                  {/* Description Skeleton */}
                  <div className="space-y-2 mb-4">
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>

                  {/* Tags Skeleton */}
                  <div className="flex gap-2 mb-4">
                    <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="w-18 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>

                  {/* Meta Info Skeleton */}
                  <div className="flex gap-4">
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>

                {/* Thumbnail Skeleton */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
