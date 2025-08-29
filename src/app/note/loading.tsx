'use client';

import { Skeleton } from '@mui/material';

export default function LoadingNote() {
  return (
    <div className="flex min-h-screen bg-[color:var(--background)]">
      {/* Sidebar Skeleton */}
      <div className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2">
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header Skeleton */}
        <div className="w-full flex items-center justify-between px-6 py-3 border-b border-black/10 dark:border-white/10">
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

        {/* Editor Content Skeleton */}
        <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
          {/* Title skeleton */}
          <Skeleton 
            variant="text" 
            width="60%" 
            height={48} 
            sx={{ mb: 4, fontSize: '2rem' }} 
          />
          
          {/* Content skeleton */}
          <div className="flex flex-col gap-3">
            <Skeleton variant="rectangular" width="100%" height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="95%" height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="87%" height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={24} sx={{ borderRadius: 1, mt: 2 }} />
            <Skeleton variant="rectangular" width="92%" height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="98%" height={24} sx={{ borderRadius: 1 }} />
            
            {/* Code block skeleton */}
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Skeleton variant="rectangular" width="30%" height={16} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="rectangular" width="85%" height={16} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" width="78%" height={16} sx={{ borderRadius: 1, mb: 1 }} />
              <Skeleton variant="rectangular" width="92%" height={16} sx={{ borderRadius: 1 }} />
            </div>
            
            <Skeleton variant="rectangular" width="100%" height={24} sx={{ borderRadius: 1, mt: 3 }} />
            <Skeleton variant="rectangular" width="88%" height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="94%" height={24} sx={{ borderRadius: 1 }} />
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
