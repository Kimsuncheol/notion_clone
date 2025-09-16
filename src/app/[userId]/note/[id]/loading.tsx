'use client';

import { Skeleton } from '@mui/material';

export default function LoadingNote() {
  return (
    <div className="flex min-h-screen bg-[color:var(--background)]">
      {/* Sidebar Skeleton */}
      <div className="hidden sm:block w-60 shrink-0 py-4 px-2">
        <div className="flex flex-col gap-2">
          {/* Search/Create button skeleton */}
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={40} 
            sx={{ borderRadius: 1, mb: 2 }} 
          />
          
          {/* Folder structure skeleton */}
          <div className="flex flex-col gap-1">
            <Skeleton variant="rectangular" width="80%" height={24} sx={{ borderRadius: 1 }} />
            <div className="ml-4 flex flex-col gap-1">
              <Skeleton variant="rectangular" width="90%" height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="85%" height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="92%" height={20} sx={{ borderRadius: 1 }} />
            </div>
          </div>
          
          {/* Another folder */}
          <div className="flex flex-col gap-1 mt-2">
            <Skeleton variant="rectangular" width="75%" height={24} sx={{ borderRadius: 1 }} />
            <div className="ml-4 flex flex-col gap-1">
              <Skeleton variant="rectangular" width="88%" height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="82%" height={20} sx={{ borderRadius: 1 }} />
            </div>
          </div>
          
          {/* Favorites section */}
          <div className="flex flex-col gap-1 mt-4">
            <Skeleton variant="rectangular" width="70%" height={24} sx={{ borderRadius: 1 }} />
            <div className="ml-4 flex flex-col gap-1">
              <Skeleton variant="rectangular" width="85%" height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="90%" height={20} sx={{ borderRadius: 1 }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - MarkdownPreviewPane Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="w-full flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1 }} />
            <Skeleton variant="circular" width={32} height={32} />
          </div>
        </div>

        {/* MarkdownPreviewPane Content Skeleton */}
        <div className="flex flex-col no-scrollbar overflow-y-auto w-full">
          {/* Writer Info Section Skeleton */}
          <div className="p-6">
            {/* Title Skeleton */}
            <Skeleton 
              variant="text" 
              width="70%" 
              height={56} 
              sx={{ mb: 3, fontSize: '2.5rem' }} 
            />
            
            {/* Author Info Skeleton */}
            <div className="flex items-center gap-4 mb-4">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex flex-col gap-1">
                <Skeleton variant="rectangular" width={120} height={20} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={80} height={16} sx={{ borderRadius: 1 }} />
              </div>
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1, ml: 'auto' }} />
            </div>
            
            {/* Tags Skeleton */}
            <div className="flex items-center gap-2 mb-4">
              <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: '1rem' }} />
              <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: '1rem' }} />
              <Skeleton variant="rectangular" width={90} height={32} sx={{ borderRadius: '1rem' }} />
            </div>
            
            {/* View Count & Actions Skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
              <div className="flex items-center gap-4">
                <Skeleton variant="rectangular" width={40} height={20} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={50} height={20} sx={{ borderRadius: 1 }} />
              </div>
            </div>
          </div>
          
          {/* Series Index Container Skeleton */}
          <div className="p-6">
            <Skeleton variant="rectangular" width={200} height={24} sx={{ borderRadius: 1, mb: 2 }} />
            <div className="flex flex-col gap-2">
              <Skeleton variant="rectangular" width="100%" height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="95%" height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="90%" height={20} sx={{ borderRadius: 1 }} />
            </div>
          </div>
          
          {/* Thumbnail Skeleton */}
          <div className="p-6">
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={300} 
              sx={{ borderRadius: 2 }} 
            />
          </div>
          
          {/* Markdown Content Skeleton */}
          <div className="flex-1 p-4 prose prose-lg dark:prose-invert">
            {/* Heading Skeletons */}
            <Skeleton 
              variant="text" 
              width="50%" 
              height={40} 
              sx={{ mb: 3, fontSize: '1.5rem' }} 
            />
            
            {/* Paragraph Skeletons */}
            <div className="flex flex-col gap-3 mb-6">
              <Skeleton variant="rectangular" width="100%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="95%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="87%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="92%" height={24} sx={{ borderRadius: 1 }} />
            </div>
            
            {/* Code Block Skeleton */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Skeleton variant="rectangular" width="30%" height={16} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="rectangular" width="85%" height={16} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" width="78%" height={16} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" width="92%" height={16} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" width="88%" height={16} sx={{ borderRadius: 1 }} />
            </div>
            
            {/* More content skeletons */}
            <div className="flex flex-col gap-3 mb-6">
              <Skeleton variant="rectangular" width="100%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="88%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="94%" height={24} sx={{ borderRadius: 1 }} />
            </div>
            
            {/* Math/KaTeX Block Skeleton */}
            <div className="mb-6 text-center">
              <Skeleton variant="rectangular" width="60%" height={40} sx={{ borderRadius: 1, mx: 'auto' }} />
            </div>
            
            {/* List Skeleton */}
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-start gap-2">
                <Skeleton variant="circular" width={8} height={8} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" width="85%" height={20} sx={{ borderRadius: 1 }} />
              </div>
              <div className="flex items-start gap-2">
                <Skeleton variant="circular" width={8} height={8} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" width="90%" height={20} sx={{ borderRadius: 1 }} />
              </div>
              <div className="flex items-start gap-2">
                <Skeleton variant="circular" width={8} height={8} sx={{ mt: 1 }} />
                <Skeleton variant="rectangular" width="78%" height={20} sx={{ borderRadius: 1 }} />
              </div>
            </div>
          </div>
          
          {/* Self Introduction Skeleton */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton variant="circular" width={64} height={64} />
              <div className="flex flex-col gap-2">
                <Skeleton variant="rectangular" width={150} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={100} height={20} sx={{ borderRadius: 1 }} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton variant="rectangular" width="100%" height={20} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="85%" height={20} sx={{ borderRadius: 1 }} />
            </div>
          </div>
          
          {/* Comments Section Skeleton */}
          <div className="p-6">
            <Skeleton variant="rectangular" width={120} height={28} sx={{ borderRadius: 1, mb: 4 }} />
            
            {/* Comment Input Skeleton */}
            <div className="mb-6">
              <Skeleton variant="rectangular" width="100%" height={100} sx={{ borderRadius: 2, mb: 2 }} />
              <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
            </div>
            
            {/* Comments List Skeleton */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="mb-4 pb-4">
                <div className="flex items-start gap-3">
                  <Skeleton variant="circular" width={40} height={40} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Skeleton variant="rectangular" width={100} height={16} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={80} height={14} sx={{ borderRadius: 1 }} />
                    </div>
                    <Skeleton variant="rectangular" width="90%" height={20} sx={{ borderRadius: 1, mb: 2 }} />
                    <Skeleton variant="rectangular" width="70%" height={20} sx={{ borderRadius: 1 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating AI Chat Button Skeleton */}
      <div className="fixed bottom-10 right-10">
        <Skeleton 
          variant="circular" 
          width={56} 
          height={56} 
          sx={{ 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' 
          }} 
        />
      </div>
    </div>
  );
}
