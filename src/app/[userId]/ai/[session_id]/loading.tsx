import React from 'react';
import { Skeleton, Box, Container } from '@mui/material';
import { grayColor2 } from '@/constants/color';

export default function AILoading() {
  return (
    <Box 
      className="min-h-screen"
      sx={{ 
        backgroundColor: 'transparent',
        color: 'white'
      }}
    >
      <Container maxWidth="md" className="px-4 py-8">
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center'
          }}
        >
          {/* Main heading skeleton */}
          <Skeleton 
            variant="text" 
            width={320}
            height={48}
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.08)',
              mb: 4,
              borderRadius: 1
            }}
          />

          {/* Animated loading dots */}
          <Box sx={{ mb: 6 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {[0, 1, 2].map((index) => (
                <Box
                  key={index}
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '50%',
                    animation: 'pulse 1.5s ease-in-out infinite',
                    animationDelay: `${index * 0.2}s`,
                    '@keyframes pulse': {
                      '0%, 80%, 100%': {
                        opacity: 0.2,
                      },
                      '40%': {
                        opacity: 0.8,
                      },
                    },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Question input skeleton */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 600,
              bgcolor: grayColor2,
              borderRadius: 3,
              border: '1px solid rgba(255, 255, 255, 0.08)',
              mb: 4,
              p: 3,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Skeleton 
              variant="text" 
              width="40%"
              height={24}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1
              }}
            />
          </Box>

          {/* Action buttons skeleton */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* Speed/Model selector button skeleton */}
            <Skeleton
              variant="rounded"
              width={120}
              height={44}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 2
              }}
            />

            {/* Search button skeleton */}
            <Skeleton
              variant="rounded"
              width={100}
              height={44}
              sx={{ 
                bgcolor: 'rgba(35, 131, 226, 0.3)',
                borderRadius: 2
              }}
            />
          </Box>

          {/* Additional subtle loading elements */}
          <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Skeleton 
              variant="text" 
              width={200}
              height={16}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 1
              }}
            />
            <Skeleton 
              variant="text" 
              width={150}
              height={14}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 1
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}