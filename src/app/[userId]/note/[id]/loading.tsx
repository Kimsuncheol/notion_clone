'use client';

import { Skeleton } from '@mui/material';

function ToolbarSkeleton() {
  return (
    <div className="border-b border-gray-200 bg-[color:var(--background)] px-4 py-4 dark:border-gray-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={`toolbar-chip-${index}`}
              variant="rectangular"
              width={72}
              height={32}
              sx={{ borderRadius: 16 }}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Skeleton variant="rectangular" width={160} height={36} sx={{ borderRadius: 18 }} />
          <Skeleton variant="rectangular" width={120} height={28} sx={{ borderRadius: 14 }} />
          <Skeleton variant="rectangular" width={200} height={20} sx={{ borderRadius: 10 }} />
        </div>
      </div>
    </div>
  );
}

function EditorPaneSkeleton() {
  return (
    <div className="hidden xl:flex xl:w-1/2 flex-col border-r border-gray-200 dark:border-gray-800">
      <div className="w-full border-b border-gray-200 px-6 py-6 dark:border-gray-800">
        <Skeleton variant="text" width="70%" height={48} sx={{ fontSize: '2rem' }} />
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
              key={`editor-tag-${index}`}
              variant="rectangular"
              width={96}
              height={28}
              sx={{ borderRadius: 9999 }}
            />
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-6 py-6">
        <div className="flex h-full flex-col gap-4">
          <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: 12 }} />
          <Skeleton variant="rectangular" width="100%" height={220} sx={{ borderRadius: 12 }} />
          <Skeleton variant="rectangular" width="80%" height={48} sx={{ borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}

function PreviewPaneSkeleton() {
  const paragraphWidths = ['100%', '95%', '92%', '88%'];
  const codeLineWidths = ['90%', '85%', '80%', '75%'];
  const extraParagraphWidths = ['100%', '90%', '84%'];

  return (
    <div className="flex-1 overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-3xl flex-col gap-8 overflow-y-auto px-6 py-10">
        <div className="flex flex-col gap-6">
          <Skeleton variant="text" width="80%" height={48} sx={{ fontSize: '2.25rem' }} />
          <div className="flex flex-wrap items-center gap-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" width={140} height={20} />
              <Skeleton variant="text" width={100} height={18} />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Skeleton variant="rectangular" width={96} height={32} sx={{ borderRadius: 20 }} />
              <Skeleton variant="rectangular" width={120} height={32} sx={{ borderRadius: 20 }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton
                key={`tag-pill-${index}`}
                variant="rectangular"
                width={100}
                height={32}
                sx={{ borderRadius: 9999 }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {paragraphWidths.map((width, index) => (
            <Skeleton
              key={`paragraph-${index}`}
              variant="rectangular"
              width={width}
              height={24}
              sx={{ borderRadius: 8 }}
            />
          ))}
        </div>

        <div className="space-y-2 rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
          {codeLineWidths.map((width, index) => (
            <Skeleton
              key={`code-line-${index}`}
              variant="rectangular"
              width={width}
              height={18}
              sx={{ borderRadius: 6 }}
            />
          ))}
        </div>

        <div className="space-y-3">
          {extraParagraphWidths.map((width, index) => (
            <Skeleton
              key={`extra-${index}`}
              variant="rectangular"
              width={width}
              height={22}
              sx={{ borderRadius: 8 }}
            />
          ))}
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
          <Skeleton variant="text" width="40%" height={24} />
          {Array.from({ length: 2 }).map((_, index) => (
            <Skeleton
              key={`comment-${index}`}
              variant="rectangular"
              width="100%"
              height={72}
              sx={{ borderRadius: 12 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function TableOfContentsSkeleton() {
  const itemWidths = ['80%', '74%', '68%', '64%', '60%', '56%'];

  return (
    <aside className="hidden w-64 flex-col gap-4 border-l border-gray-200 px-6 py-10 dark:border-gray-800 lg:flex">
      <Skeleton variant="text" width="70%" height={24} />
      {itemWidths.map((width, index) => (
        <div key={`toc-${index}`} className="flex items-center gap-3">
          <Skeleton variant="circular" width={8} height={8} />
          <Skeleton variant="rectangular" width={width} height={18} sx={{ borderRadius: 6 }} />
        </div>
      ))}
    </aside>
  );
}

function FloatingChatSkeleton() {
  return (
    <div className="pointer-events-none fixed bottom-8 right-8 z-30">
      <Skeleton
        variant="circular"
        width={60}
        height={60}
        sx={{ boxShadow: '0 18px 30px rgba(15, 23, 42, 0.22)' }}
      />
    </div>
  );
}

export default function LoadingNote() {
  return (
    <div className="flex min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="flex w-full flex-col">
        <ToolbarSkeleton />
        <div className="flex min-h-0 flex-1">
          <EditorPaneSkeleton />
          <div className="flex min-h-0 flex-1">
            <PreviewPaneSkeleton />
            <TableOfContentsSkeleton />
          </div>
        </div>
      </div>
      <FloatingChatSkeleton />
    </div>
  );
}
