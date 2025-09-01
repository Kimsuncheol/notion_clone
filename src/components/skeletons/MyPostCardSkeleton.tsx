import React from 'react';
import { Skeleton, Card, CardContent, Box } from '@mui/material';

export default function MyPostCardSkeleton() {
  return (
    <Card
      sx={{
        backgroundColor: "transparent",
        color: "#fff",
        border: 0,
        borderRadius: "0.5rem",
        boxShadow: "none",
      }}
    >
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#fff',
      }}>
        {/* Thumbnail skeleton - full width at top */}
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={200}
          sx={{ bgcolor: '#404040', borderRadius: 1 }}
        />

        {/* Content section */}
        <CardContent sx={{
          padding: '0px',
        }}>
          {/* Title skeleton */}
          <Box sx={{ marginBottom: '16px' }}>
            <Skeleton 
              variant="rectangular" 
              width="80%" 
              height={32}
              sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '8px' }}
            />
            <Skeleton 
              variant="rectangular" 
              width="60%" 
              height={32}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
          </Box>

          {/* Content preview skeleton */}
          <Box sx={{ marginBottom: '16px' }}>
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height={20}
              sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '8px' }}
            />
            <Skeleton 
              variant="rectangular" 
              width="90%" 
              height={20}
              sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '8px' }}
            />
            <Skeleton 
              variant="rectangular" 
              width="75%" 
              height={20}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
          </Box>

          {/* Bottom metadata skeleton */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '16px',
            borderTop: '1px solid #6b7280',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Skeleton 
                variant="rectangular" 
                width={80} 
                height={16}
                sx={{ bgcolor: '#404040', borderRadius: 1 }}
              />
              <Skeleton 
                variant="rectangular" 
                width={60} 
                height={16}
                sx={{ bgcolor: '#404040', borderRadius: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Skeleton 
                variant="rectangular" 
                width={40} 
                height={16}
                sx={{ bgcolor: '#404040', borderRadius: 1 }}
              />
              <Skeleton 
                variant="rectangular" 
                width={60} 
                height={16}
                sx={{ bgcolor: '#404040', borderRadius: 1 }}
              />
            </Box>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
}
