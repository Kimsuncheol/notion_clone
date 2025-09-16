import React from 'react';
import { Box, Typography } from '@mui/material';

export default function AIHeader() {
  return (
    <Box sx={{ textAlign: 'center', mb: 6 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        sx={{ 
          mb: 4,
          fontWeight: 400,
          color: 'rgba(255, 255, 255, 0.9)'
        }}
      >
        Need any assistance?
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              bgcolor: 'rgba(255, 255, 255, 0.4)',
              borderRadius: '50%',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: `${index * 0.2}s`,
              '@keyframes pulse': {
                '0%, 80%, 100%': {
                  opacity: 0.3,
                },
                '40%': {
                  opacity: 1,
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}