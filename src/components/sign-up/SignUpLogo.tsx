'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';

export default function SignUpLogo() {
  return (
    <Box sx={{ textAlign: 'center', width: '30%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Box sx={{ width: 128, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Box sx={{ position: 'relative' }}>
            <Box 
              sx={{ 
                width: 64, 
                height: 64, 
                bgcolor: 'primary.main', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'background.paper', 
                  borderRadius: '50%' 
                }} 
              />
            </Box>
            <Box 
              sx={{ 
                position: 'absolute', 
                left: -24, 
                top: 8, 
                width: 24, 
                height: 24, 
                bgcolor: 'pink.400', 
                borderRadius: '50%' 
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                right: -24, 
                top: 8, 
                width: 24, 
                height: 24, 
                bgcolor: 'blue.400', 
                borderRadius: '50%' 
              }} 
            />
            <Box 
              sx={{ 
                position: 'absolute', 
                left: 8, 
                top: -16, 
                width: 16, 
                height: 16, 
                bgcolor: 'yellow.400', 
                borderRadius: '50%' 
              }} 
            />
          </Box>
        </Box>
      </Box>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
        Welcome!
      </Typography>
    </Box>
  );
}