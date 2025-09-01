import React from 'react';
import { Skeleton } from '@mui/material';
import MyPostCardSkeleton from './MyPostCardSkeleton';

export default function MyPostsSkeleton() {
  return (
    <div className='w-full flex flex-col gap-25'>
      {/* Search bar skeleton */}
      <div className='w-full flex justify-end'>
        <Skeleton 
          variant="rectangular" 
          width="25%" 
          height={40}
          sx={{ bgcolor: '#404040', borderRadius: 1 }}
        />
      </div>
      
      <div className='w-full flex'>
        {/* Sidebar skeleton */}
        <div className='w-[25%] px-10'>
          <div className='flex flex-col gap-4'>
            {/* Sidebar title */}
            <Skeleton 
              variant="rectangular" 
              width="80%" 
              height={24}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
            
            {/* Sidebar filters */}
            <div className='flex flex-col gap-2'>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton 
                  key={index}
                  variant="rectangular" 
                  width="90%" 
                  height={20}
                  sx={{ bgcolor: '#404040', borderRadius: 1 }}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Post cards skeleton */}
        <div className='w-[75%] h-full flex flex-col gap-25'>
          {Array.from({ length: 6 }).map((_, index) => (
            <MyPostCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
