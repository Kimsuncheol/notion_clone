import React from 'react';
import { grayColor2 } from '@/constants/color';
import { 
  SelfIntroductionSkeleton, 
  MyPostTabbarSkeleton, 
  MyPostContentSkeleton 
} from '@/components/skeletons';

export default function SeriesLoading() {
  return (
    <div className='w-[80%] min-h-screen px-2 mx-auto' style={{ backgroundColor: grayColor2 }}>
      {/* Header skeleton - matching TrendingHeader */}
      <div className='w-full py-8'>
        <div className='flex justify-center'>
          <div 
            className="h-8 w-32 rounded animate-pulse"
            style={{ backgroundColor: '#404040' }}
          />
        </div>
      </div>
      
      <div className='px-2'>
        <div className='w-full h-full mx-auto flex flex-col items-end justify-center gap-10'>
          <div className='w-[75%]'>
            <SelfIntroductionSkeleton />
            <MyPostTabbarSkeleton />
          </div>
          
          {/* Default to posts skeleton - will show posts skeleton by default */}
          <MyPostContentSkeleton />
          
          {/* To show series skeleton, pass tab="series" */}
          {/* <MyPostContentSkeleton tab="series" /> */}
        </div>
      </div>
    </div>
  );
}
