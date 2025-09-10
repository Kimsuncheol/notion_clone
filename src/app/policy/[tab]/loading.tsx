import React from 'react';
import { Skeleton, Box, Container } from '@mui/material';

export default function PolicyLoading() {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Skeleton */}
      <Box className="border-b border-gray-800">
        <Container maxWidth="lg" className="px-4 py-4">
          <Box className="flex items-center justify-between">
            <Skeleton 
              variant="text" 
              width={80} 
              height={40}
              sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
            />
            <Box className="flex items-center space-x-4">
              <Skeleton 
                variant="circular" 
                width={24} 
                height={24}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
              />
              <Skeleton 
                variant="rounded" 
                width={120} 
                height={36}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
              />
              <Skeleton 
                variant="circular" 
                width={32} 
                height={32}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content Skeleton */}
      <Container maxWidth="md" className="px-4 py-8">
        {/* Tab Navigation Skeleton */}
        <Box className="flex mb-8 space-x-6">
          <Skeleton 
            variant="text" 
            width={100} 
            height={48}
            sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
          />
          <Skeleton 
            variant="text" 
            width={140} 
            height={48}
            sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
          />
        </Box>

        {/* Content Area Skeleton */}
        <Box className="space-y-8">
          {/* Title Skeleton */}
          <Skeleton 
            variant="text" 
            width="60%" 
            height={48}
            sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
          />

          {/* Section Skeletons */}
          {[1, 2, 3, 4, 5].map((section) => (
            <Box key={section} className="space-y-4">
              {/* Section Title */}
              <Skeleton 
                variant="text" 
                width="40%" 
                height={32}
                sx={{ bgcolor: 'rgba(255,255,255,0.1)' }}
              />
              
              {/* Section Content */}
              <Box className="space-y-2">
                <Skeleton 
                  variant="text" 
                  width="100%" 
                  height={24}
                  sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
                />
                <Skeleton 
                  variant="text" 
                  width="95%" 
                  height={24}
                  sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
                />
                <Skeleton 
                  variant="text" 
                  width="90%" 
                  height={24}
                  sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
                />
                <Skeleton 
                  variant="text" 
                  width="85%" 
                  height={24}
                  sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}
                />
              </Box>

              {/* List Items Skeleton */}
              <Box className="ml-6 space-y-2">
                {[1, 2, 3].map((item) => (
                  <Skeleton 
                    key={item}
                    variant="text" 
                    width={`${Math.random() * 30 + 70}%`}
                    height={20}
                    sx={{ bgcolor: 'rgba(255,255,255,0.06)' }}
                  />
                ))}
              </Box>
            </Box>
          ))}

          {/* Footer Skeleton */}
          <Box className="mt-12 pt-8">
            <Skeleton 
              variant="text" 
              width="30%" 
              height={20}
              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
            />
            <Skeleton 
              variant="text" 
              width="50%" 
              height={16}
              sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}
            />
          </Box>
        </Box>
      </Container>
    </div>
  );
}