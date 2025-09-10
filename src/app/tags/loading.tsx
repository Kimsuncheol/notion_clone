import React from 'react'
import { Skeleton, Box } from '@mui/material';

// Individual tag card skeleton component
function TagsCardSkeleton() {
  return (
    <Box
      sx={{
        borderRadius: 2,
        p: 2,
        cursor: 'pointer',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Skeleton
          variant="rectangular"
          width="70%"
          height={24}
          sx={{ 
            bgcolor: '#404040', 
            borderRadius: 1,
            mb: 1
          }}
        />
      </Box>
      <Skeleton
        variant="rectangular"
        width="50%"
        height={16}
        sx={{ 
          bgcolor: '#404040', 
          borderRadius: 1
        }}
      />
    </Box>
  );
}

// Tabbar skeleton component
function TagsTabbarSkeleton() {
  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Skeleton
          variant="rectangular"
          width={80}
          height={40}
          sx={{ 
            bgcolor: '#404040', 
            borderRadius: 1
          }}
        />
        <Skeleton
          variant="rectangular"
          width={80}
          height={40}
          sx={{ 
            bgcolor: '#404040', 
            borderRadius: 1
          }}
        />
      </Box>
    </Box>
  );
}

export default function TagsLoading() {
  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', px: 2, py: 3 }}>
      {/* Tabbar skeleton */}
      <TagsTabbarSkeleton />
      
      {/* Tags grid skeleton */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <TagsCardSkeleton key={index} />
        ))}
      </Box>
    </Box>
  )
}
