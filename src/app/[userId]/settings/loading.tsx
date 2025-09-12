import React from 'react';
import { Box, Paper, Skeleton, Divider } from '@mui/material';

const SettingsContentSkeleton = () => (
  <Box sx={{ px: 2, py: 6 }}>
    {/* Settings title */}
    <Skeleton 
      variant="text" 
      width={200} 
      height={40} 
      sx={{ mb: 4, bgcolor: 'rgba(255, 255, 255, 0.13)' }} 
    />
    
    {/* Settings sections */}
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Paper 
          key={index} 
          sx={{ 
            bgcolor: '#262626', 
            p: 3, 
            borderRadius: 2 
          }}
        >
          {/* Section title */}
          <Skeleton 
            variant="text" 
            width={150} 
            height={32} 
            sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.13)' }} 
          />
          
          {/* Section content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Skeleton 
                variant="text" 
                width={160} 
                height={24} 
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.13)' }} 
              />
              <Skeleton 
                variant="rounded" 
                width={48} 
                height={24} 
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.13)', borderRadius: 3 }} 
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Skeleton 
                variant="text" 
                width={140} 
                height={24} 
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.13)' }} 
              />
              <Skeleton 
                variant="rounded" 
                width={80} 
                height={32} 
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.13)' }} 
              />
            </Box>
            {index === 3 && (
              <>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mt: 1 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
                  <Skeleton 
                    variant="text" 
                    width={120} 
                    height={24} 
                    sx={{ bgcolor: 'rgba(244, 67, 54, 0.3)' }} 
                  />
                  <Skeleton 
                    variant="rounded" 
                    width={96} 
                    height={32} 
                    sx={{ bgcolor: 'rgba(244, 67, 54, 0.3)' }} 
                  />
                </Box>
              </>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  </Box>
);

export default function SettingsLoading() {
  return <SettingsContentSkeleton />;
}