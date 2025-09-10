import React from 'react';
import { Skeleton, Box, Card, CardContent, Avatar } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ minHeight: '100vh', p: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Tag Header Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Skeleton variant="rounded" width={120} height={32} />
            <Skeleton variant="text" width={80} height={24} />
          </Box>
          <Skeleton variant="text" width={300} height={20} />
          <Skeleton variant="text" width={250} height={20} />
        </Box>

        {/* Posts Grid Skeleton */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} sx={{ p: 2 }}>
              <CardContent>
                {/* Post Title Skeleton */}
                <Skeleton variant="text" width="100%" height={28} sx={{ mb: 2 }} />
                
                {/* Post Description Skeleton */}
                <Box sx={{ mb: 3 }}>
                  <Skeleton variant="text" width="100%" height={20} />
                  <Skeleton variant="text" width="85%" height={20} />
                  <Skeleton variant="text" width="60%" height={20} />
                </Box>

                {/* Author Info Skeleton */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <Skeleton variant="circular">
                    <Avatar />
                  </Skeleton>
                  <Box>
                    <Skeleton variant="text" width={80} height={16} />
                    <Skeleton variant="text" width={60} height={14} />
                  </Box>
                </Box>

                {/* Tags Skeleton */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Skeleton variant="rounded" width={60} height={24} />
                  <Skeleton variant="rounded" width={80} height={24} />
                  <Skeleton variant="rounded" width={50} height={24} />
                </Box>

                {/* Meta Info Skeleton */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Skeleton variant="text" width={40} height={16} />
                    <Skeleton variant="text" width={40} height={16} />
                  </Box>
                  <Skeleton variant="text" width={70} height={16} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Pagination Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Skeleton variant="rounded" width={120} height={40} />
        </Box>
      </Box>
    </Box>
  );
}