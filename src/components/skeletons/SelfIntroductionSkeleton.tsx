import React from 'react';
import { Skeleton } from '@mui/material';

export default function SelfIntroductionSkeleton() {
  return (
    <div className='flex flex-col gap-10 py-10'>
      {/* Avatar and Name */}
      <div className='w-full flex items-center gap-10 border-b border-gray-300 pb-10'>
        <Skeleton 
          variant="circular" 
          width={140} 
          height={140}
          sx={{ bgcolor: '#404040' }}
        />
        <div className='flex flex-col gap-2'>
          <Skeleton 
            variant="rectangular" 
            width={200} 
            height={32}
            sx={{ bgcolor: '#404040', borderRadius: 1 }}
          />
          <Skeleton 
            variant="rectangular" 
            width={250} 
            height={24}
            sx={{ bgcolor: '#404040', borderRadius: 1 }}
          />
        </div>
      </div>
      
      {/* Followers and Following */}
      <div className='w-full flex items-center gap-10 border-b border-gray-300 pb-10'>
        <div className='flex gap-4 items-center'>
          <div className='flex flex-col items-center gap-2'>
            <Skeleton 
              variant="rectangular" 
              width={48} 
              height={32}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
            <Skeleton 
              variant="rectangular" 
              width={70} 
              height={16}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
          </div>
          <div className='flex flex-col items-center gap-2'>
            <Skeleton 
              variant="rectangular" 
              width={48} 
              height={32}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
            <Skeleton 
              variant="rectangular" 
              width={70} 
              height={16}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
          </div>
          <div className='flex flex-col items-center gap-2'>
            <Skeleton 
              variant="rectangular" 
              width={48} 
              height={32}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
            <Skeleton 
              variant="rectangular" 
              width={50} 
              height={16}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
