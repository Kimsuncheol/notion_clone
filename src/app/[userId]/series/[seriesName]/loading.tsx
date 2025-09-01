import React from 'react';
import { Skeleton, Box, Divider } from '@mui/material';

export default function SeriesNameLoading() {
  return (
    <Box sx={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '0 20px',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header Skeleton */}
      <Box sx={{ paddingTop: '40px', paddingBottom: '20px' }}>
        <Skeleton 
          variant="rectangular" 
          width={80} 
          height={20}
          sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '16px' }}
        />
        <Skeleton 
          variant="rectangular" 
          width={400} 
          height={48}
          sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '40px' }}
        />
      </Box>

      {/* Main Content Skeleton */}
      <Box sx={{ display: 'flex', gap: '60px', position: 'relative' }}>
        {/* Posts List Skeleton */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index}>
                <Box sx={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Post Number and Thumbnail Skeleton */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <Skeleton 
                      variant="rectangular" 
                      width={20} 
                      height={24}
                      sx={{ bgcolor: '#404040', borderRadius: 1 }}
                    />
                    
                    {/* Thumbnail Skeleton */}
                    <Skeleton 
                      variant="rectangular" 
                      width={120} 
                      height={80}
                      sx={{ bgcolor: '#404040', borderRadius: 1 }}
                    />
                  </Box>

                  {/* Post Content Skeleton */}
                  <Box sx={{ flex: 1 }}>
                    <Skeleton 
                      variant="rectangular" 
                      width="80%" 
                      height={28}
                      sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '8px' }}
                    />
                    
                    <Box sx={{ marginBottom: '12px' }}>
                      <Skeleton 
                        variant="rectangular" 
                        width="100%" 
                        height={16}
                        sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '4px' }}
                      />
                      <Skeleton 
                        variant="rectangular" 
                        width="90%" 
                        height={16}
                        sx={{ bgcolor: '#404040', borderRadius: 1, marginBottom: '4px' }}
                      />
                      <Skeleton 
                        variant="rectangular" 
                        width="70%" 
                        height={16}
                        sx={{ bgcolor: '#404040', borderRadius: 1 }}
                      />
                    </Box>
                    
                    <Skeleton 
                      variant="rectangular" 
                      width={100} 
                      height={14}
                      sx={{ bgcolor: '#404040', borderRadius: 1 }}
                    />
                  </Box>
                </Box>
                
                {/* Divider between posts */}
                {index < 3 && (
                  <Divider sx={{ 
                    marginTop: '40px', 
                    backgroundColor: '#404040' 
                  }} />
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Sidebar Skeleton */}
        <Box sx={{ 
          width: '200px', 
          flexShrink: 0,
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            padding: '20px',
            backgroundColor: '#2a2a2a',
            borderRadius: '8px',
            border: '1px solid #404040'
          }}>
            <Box sx={{ display: 'flex', gap: '8px' }}>
              <Skeleton 
                variant="rectangular" 
                width={40} 
                height={16}
                sx={{ bgcolor: '#404040', borderRadius: 1 }}
              />
              <Skeleton 
                variant="rectangular" 
                width={40} 
                height={16}
                sx={{ bgcolor: '#404040', borderRadius: 1 }}
              />
            </Box>

            <Divider sx={{ backgroundColor: '#404040' }} />

            <Skeleton 
              variant="rectangular" 
              width={80} 
              height={20}
              sx={{ bgcolor: '#404040', borderRadius: 1 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
