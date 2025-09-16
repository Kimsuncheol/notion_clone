import React from 'react';
import { Box, Typography } from '@mui/material';
import EyeBalls from './EyeBalls';

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

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <EyeBalls />
      </Box>
    </Box>
  );
}