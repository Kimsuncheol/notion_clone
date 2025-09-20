'use client';

import React from 'react';

// Reusable skeleton components using only Tailwind classes
const SkeletonLine = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 ${className}`} />
);

const SkeletonLineSmall = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-3 ${className}`} />
);

const SkeletonLineLarge = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-6 ${className}`} />
);

const SkeletonLineXL = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-12 ${className}`} />
);

const SkeletonCircle = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-8 h-8 ${className}`} />
);

const SkeletonCircleSmall = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-6 h-6 ${className}`} />
);

const SkeletonCircleLarge = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-10 h-10 ${className}`} />
);

// Header skeleton matching the image design
function NoteHeaderSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Title skeleton */}
      <div className="mb-6">
        <SkeletonLineXL className="mb-4 w-2/5" />
      </div>

      {/* Author info and metadata */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SkeletonCircleLarge />
          <div className="flex flex-col gap-1">
            <SkeletonLine className="w-32" />
            <SkeletonLineSmall className="w-20" />
          </div>
        </div>
        
        {/* Actions area */}
        <div className="flex items-center gap-3">
          <SkeletonLineSmall className="w-16" />
          <SkeletonLineLarge className="w-20" />
        </div>
      </div>

      {/* Social actions bar */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* Like button skeleton */}
          <div className="flex items-center gap-2">
            <SkeletonCircleSmall />
            <SkeletonLineSmall className="w-5" />
          </div>
          
          {/* Share and other actions */}
          <SkeletonCircleSmall />
          <SkeletonCircleSmall />
          <SkeletonCircleSmall />
        </div>
        
        {/* Bookmark */}
        <div className="ml-auto">
          <SkeletonCircle />
        </div>
      </div>

      {/* Tags and view count */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <SkeletonLineLarge className="w-10 rounded-full" />
          <SkeletonLineLarge className="w-12 rounded-full" />
        </div>
        <SkeletonLineSmall className="w-20" />
      </div>
    </div>
  );
}

// Content section skeleton
function ContentSectionSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Section header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <SkeletonLineLarge className="w-32" />
          <div className="flex items-center gap-2">
            <SkeletonLine className="w-20" />
            <SkeletonCircleSmall />
          </div>
        </div>
      </div>

      {/* Content blocks */}
      <div className="space-y-6">
        {/* Text content blocks */}
        <div className="space-y-3">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-11/12" />
          <SkeletonLine className="w-5/6" />
        </div>

        {/* Image/media block skeleton */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48 w-full" />
        </div>

        {/* More text content */}
        <div className="space-y-3">
          <SkeletonLine className="w-11/12" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
        </div>

        {/* List/bullet points skeleton */}
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-2 h-2 mt-2" />
              <SkeletonLine className={i % 2 === 0 ? "w-4/5" : "w-11/12"} />
            </div>
          ))}
        </div>

        {/* Code block skeleton */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
          <SkeletonLineSmall className="w-2/5" />
          <SkeletonLineSmall className="w-5/6" />
          <SkeletonLineSmall className="w-3/5" />
          <SkeletonLineSmall className="w-4/5" />
        </div>
        
        <SkeletonLine className="w-full mt-3" />
        <SkeletonLine className="w-5/6" />
        <SkeletonLine className="w-11/12" />
      </div>
    </div>
  );
}

// Left sidebar skeleton
function SidebarSkeleton() {
  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4 z-10">
      {/* Logo/brand skeleton */}
      <div className="mb-8">
        <SkeletonLineLarge className="w-32" />
      </div>

      {/* Navigation items */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonCircleSmall />
            <SkeletonLineSmall className={i % 3 === 0 ? "w-2/3" : i % 3 === 1 ? "w-3/4" : "w-4/5"} />
          </div>
        ))}
      </div>

      {/* Workspace section */}
      <div className="mt-8 space-y-3">
        <SkeletonLine className="w-20" />
        <div className="ml-4 space-y-2">
          {[...Array(3)].map((_, i) => (
            <SkeletonLineSmall key={i} className={i % 3 === 0 ? "w-3/4" : i % 3 === 1 ? "w-4/5" : "w-5/6"} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoadingNote() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar for larger screens */}
      <div className="hidden lg:block">
        <SidebarSkeleton />
      </div>

      {/* Main content area */}
      <div className="lg:ml-64">
        {/* Top navigation bar skeleton */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 z-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SkeletonCircle className="lg:hidden" />
              <SkeletonLineLarge className="w-40" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonLineLarge className="w-24" />
              <SkeletonCircle />
            </div>
          </div>
        </div>

        {/* Note header */}
        <NoteHeaderSkeleton />

        {/* Note content */}
        <ContentSectionSkeleton />

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>

      {/* Floating action button */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-14 h-14 shadow-lg" />
      </div>
    </div>
  );
}