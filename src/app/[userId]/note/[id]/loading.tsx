'use client';

import React from 'react';

// Reusable skeleton primitives
const SkeletonLine = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 ${className}`} />
);

const SkeletonLineSm = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-3 ${className}`} />
);

const SkeletonLineLg = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-6 ${className}`} />
);

const SkeletonLineXL = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-12 ${className}`} />
);

const SkeletonCircle = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full w-8 h-8 ${className}`} />
);

// Header skeleton mirrors MarkdownNoteHeader: title, divider, tags
function EditorHeaderSkeleton() {
  return (
    <div className="w-full flex flex-col p-4 pb-2 gap-6">
      {/* Title */}
      <div>
        <SkeletonLineXL className="w-2/3" />
      </div>
      {/* Divider */}
      <div className="w-[60px]">
        <div className="animate-pulse bg-gray-300 dark:bg-gray-700 h-2 rounded" />
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        <SkeletonLineLg className="w-16 rounded-full" />
        <SkeletonLineLg className="w-20 rounded-full" />
        <SkeletonLineLg className="w-14 rounded-full" />
      </div>
    </div>
  );
}

// Toolbar skeleton mirrors MarkdownToolbar quick-tag strip + controls
function ToolbarSkeleton() {
  return (
    <div className="px-4 mt-4">
      {/* Tag buttons row */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        {Array.from({ length: 14 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-8 h-9" />
        ))}
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded w-9 h-9" />
      </div>
      {/* Theme selector + save status */}
      <div className="flex items-center justify-center gap-3 px-3 py-2">
        <SkeletonLineLg className="w-32 rounded" />
        <SkeletonCircle />
      </div>
    </div>
  );
}

// Left pane (editor) skeleton mirrors MarkdownEditPane + CodeMirror area
function EditorPaneSkeleton() {
  return (
    <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
      <ToolbarSkeleton />
      <div className="px-4 pb-4 mt-2 flex-1 overflow-y-auto no-scrollbar min-h-[calc(100vh-234px)]">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 h-full">
          {/* Simulated code lines */}
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonLine key={i} className={i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-5/6' : 'w-3/4'} />
            ))}
          </div>
          <div className="my-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLine key={i} className={i % 2 === 0 ? 'w-11/12' : 'w-4/5'} />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonLine key={i} className={i % 3 === 0 ? 'w-2/3' : i % 3 === 1 ? 'w-5/6' : 'w-full'} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Right pane (preview) skeleton mirrors MarkdownPreviewPane layout
function PreviewPaneSkeleton() {
  return (
    <div className="w-1/2 flex">
      <div className="flex-1 min-w-0">
        {/* Writer info section */}
        <div className="flex flex-col gap-5 p-4">
          <SkeletonLineXL className="w-3/4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SkeletonLineSm className="w-28" />
              <SkeletonLineSm className="w-20" />
            </div>
            <div className="flex items-center gap-3">
              <SkeletonLineSm className="w-16" />
              <SkeletonLineSm className="w-16" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SkeletonLineLg className="w-16 rounded-full" />
            <SkeletonLineLg className="w-12 rounded-full" />
            <SkeletonLineLg className="w-20 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <SkeletonLineSm className="w-24" />
            <div className="flex items-center gap-4">
              <SkeletonLineSm className="w-10" />
              <SkeletonLineSm className="w-14" />
            </div>
          </div>
        </div>

        {/* Content blocks */}
        <div className="p-4 space-y-6">
          <div className="space-y-3">
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-11/12" />
            <SkeletonLine className="w-5/6" />
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            <SkeletonLineSm className="w-2/5" />
            <SkeletonLineSm className="w-4/5" />
            <SkeletonLineSm className="w-3/5" />
            <SkeletonLineSm className="w-5/6" />
          </div>
          <div className="space-y-3">
            <SkeletonLine className="w-11/12" />
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoadingNote() {
  return (
    <div className="w-[90%] mx-auto flex flex-col h-full text-gray-900 dark:text-gray-100">
      {/* Header (matches MarkdownNoteHeader layout) */}
      <EditorHeaderSkeleton />

      {/* Content area (matches MarkdownContentArea in split mode) */}
      <div className="flex h-full">
        <EditorPaneSkeleton />
        <PreviewPaneSkeleton />
      </div>
    </div>
  );
}


