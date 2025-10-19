import React from 'react';

interface SkeletonLineProps {
  className?: string;
}

const SkeletonLine = ({ className = '' }: SkeletonLineProps) => (
  <div className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`} />
);

export default function HandwritingSkeleton() {
  return (
    <div className="min-h-[70vh] w-full rounded-3xl border border-gray-200 bg-white/50 p-10 shadow-sm dark:border-gray-700 dark:bg-gray-900/40">
      <div className="mb-10 space-y-4">
        <SkeletonLine className="h-3 w-36" />
        <SkeletonLine className="h-10 w-80" />
        <SkeletonLine className="h-4 w-2/3 max-w-xl" />
        <SkeletonLine className="h-4 w-1/2 max-w-sm" />
        <SkeletonLine className="h-8 w-48 rounded-full" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <div className="relative flex min-h-[320px] flex-col justify-between rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 dark:border-gray-700 dark:bg-gray-800">
          <div className="absolute inset-x-0 top-4 mx-auto h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="absolute inset-x-0 bottom-4 mx-auto h-10 w-10 rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900" />
          <div className="absolute inset-10 rounded-xl border border-gray-200/70 dark:border-gray-700/70" />
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <SkeletonLine className="h-3 w-40" />
            <SkeletonLine className="h-4 w-3/4 max-w-sm" />
            <SkeletonLine className="h-4 w-1/2 max-w-xs" />
          </div>
          <SkeletonLine className="mx-auto h-3 w-56 rounded-full" />
        </div>

        <div className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="space-y-3">
            <SkeletonLine className="h-3 w-36" />
            <SkeletonLine className="h-4 w-3/5" />
          </div>

          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                <SkeletonLine className="h-4 w-1/3" />
                <SkeletonLine className="h-3 w-4/5" />
                <SkeletonLine className="h-3 w-3/5" />
              </div>
            ))}
          </div>

          <div className="space-y-3 rounded-xl border border-amber-400/30 bg-amber-50/60 p-5 shadow-sm dark:border-amber-400/30 dark:bg-amber-500/10">
            <SkeletonLine className="h-3 w-28" />
            <SkeletonLine className="h-3 w-4/5" />
            <SkeletonLine className="h-3 w-3/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
