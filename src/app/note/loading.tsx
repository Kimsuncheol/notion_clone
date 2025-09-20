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
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-10 ${className}`} />
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

// Simplified header skeleton for public note view
function PublicNoteHeaderSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Title skeleton */}
      <div className="mb-6">
        <SkeletonLineXL className="mb-4 w-1/2" />
      </div>

      {/* Author info and metadata */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <SkeletonCircle />
          <div className="flex flex-col gap-1">
            <SkeletonLine className="w-24" />
            <SkeletonLineSmall className="w-16" />
          </div>
        </div>
        
        {/* Public badge area */}
        <div className="flex items-center gap-2">
          <SkeletonLineLarge className="w-16 rounded-full" />
        </div>
      </div>

      {/* Social actions bar - simplified for public view */}
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          {/* View count and basic actions */}
          <div className="flex items-center gap-2">
            <SkeletonCircleSmall />
            <SkeletonLineSmall className="w-20" />
          </div>
          
          <SkeletonCircleSmall />
          <SkeletonCircleSmall />
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 mb-8">
        <SkeletonLineLarge className="w-9 rounded-full" />
        <SkeletonLineLarge className="w-11 rounded-full" />
        <SkeletonLineLarge className="w-14 rounded-full" />
      </div>
    </div>
  );
}

// Simplified content skeleton for public view
function PublicContentSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto px-6">
      {/* Main content blocks */}
      <div className="space-y-6">
        {/* Text content paragraphs */}
        <div className="space-y-3">
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-11/12" />
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-11/12" />
        </div>

        {/* Section divider */}
        <div className="my-8">
          <SkeletonLineLarge className="w-40 mb-4" />
        </div>

        {/* More text content */}
        <div className="space-y-3">
          <SkeletonLine className="w-11/12" />
          <SkeletonLine className="w-full" />
          <SkeletonLine className="w-5/6" />
        </div>

        {/* Image placeholder */}
        <div className="my-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-64 w-full" />
        </div>

        {/* Code snippet skeleton */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
          <SkeletonLineSmall className="w-1/3" />
          <SkeletonLineSmall className="w-4/5" />
          <SkeletonLineSmall className="w-3/5" />
          <SkeletonLineSmall className="w-5/6" />
          <SkeletonLineSmall className="w-3/4" />
        </div>

        {/* Final content blocks */}
        <div className="space-y-3">
          <SkeletonLine className="w-5/6" />
          <SkeletonLine className="w-11/12" />
          <SkeletonLine className="w-4/5" />
        </div>
      </div>
    </div>
  );
}

// Top navigation for public note
function PublicNavSkeleton() {
  return (
    <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-20">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-4">
          {/* Logo/brand */}
          <SkeletonLineLarge className="w-24" />
        </div>
        <div className="flex items-center gap-3">
          {/* Sign in button */}
          <SkeletonLineLarge className="w-20" />
          <SkeletonCircle />
        </div>
      </div>
    </div>
  );
}

export default function LoadingNote() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Top navigation */}
      <PublicNavSkeleton />

      {/* Main content area - no sidebar for public view */}
      <div className="w-full">
        {/* Note header */}
        <PublicNoteHeaderSkeleton />

        {/* Note content */}
        <PublicContentSkeleton />

        {/* Bottom spacing */}
        <div className="h-20"></div>
      </div>

      {/* Call-to-action floating element */}
      <div className="fixed bottom-6 right-6 z-30">
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-32 h-12 shadow-lg" />
      </div>
    </div>
  );
}