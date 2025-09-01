import React from 'react';
import { Skeleton, Card, CardContent, Box } from '@mui/material';

function SeriesCardSkeleton() {
  return (
    <Card 
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid #e5e7eb'
      }}
    >
      {/* Thumbnail skeleton */}
      <Skeleton 
        variant="rectangular" 
        height={180}
        sx={{ 
          bgcolor: '#404040',
          borderRadius: '8px 8px 0 0'
        }}
      />
      
      {/* Content */}
      <CardContent 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px'
        }}
      >
        {/* Title skeleton */}
        <Box sx={{ marginBottom: '16px' }}>
          <Skeleton 
            variant="rectangular" 
            width="85%" 
            height={24}
            sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '8px' }}
          />
          <Skeleton 
            variant="rectangular" 
            width="70%" 
            height={24}
            sx={{ bgcolor: '#404040', borderRadius: 1 }}
          />
        </Box>
        
        {/* Metadata skeleton */}
        <Skeleton 
          variant="rectangular" 
          width="60%" 
          height={16}
          sx={{ bgcolor: '#404040', borderRadius: 1 }}
        />
      </CardContent>
    </Card>
  );
}

export default function MyPostSeriesSkeleton() {
  return (
    <div className='w-[75%] h-full p-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        {Array.from({ length: 6 }).map((_, index) => (
          <SeriesCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
