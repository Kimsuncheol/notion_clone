import React from 'react';
import { Skeleton } from '@mui/material';

export default function MyPostTabbarSkeleton() {
  return (
    <div className='flex justify-center items-center gap-10'>
      <Skeleton 
        variant="rectangular" 
        width={80} 
        height={36}
        sx={{ bgcolor: '#404040', borderRadius: 1 }}
      />
      <Skeleton 
        variant="rectangular" 
        width={80} 
        height={36}
        sx={{ bgcolor: '#404040', borderRadius: 1 }}
      />
    </div>
  );
}
