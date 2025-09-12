'use client';
import React from 'react';
import { Backdrop, Paper, Box } from '@mui/material';
import { blackColor3, grayColor2 } from '@/constants/color';

export default function SignUpLoadingSpinner() {
  return (
    <Backdrop open sx={{ zIndex: 1300, backgroundColor: blackColor3 }}>
      <Paper sx={{ p: 4, borderRadius: 4, bgcolor: grayColor2, color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </Box>
      </Paper>
    </Backdrop>
  );
}