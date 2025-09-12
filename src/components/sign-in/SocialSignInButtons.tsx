'use client';
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack
} from '@mui/material';
import { GitHub, X } from '@mui/icons-material';
import CustomGoogleButton from '../CustomGoogleButton';

export default function SocialSignInButtons() {
  return (
    <Stack spacing={2}>
      <Typography variant="body2" sx={{ color: 'white' }}>
        Login with social account
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2 }}>
        <IconButton 
          sx={{ 
            width: 48, 
            height: 48, 
            bgcolor: 'grey.900', 
            color: 'white',
            '&:hover': {
              bgcolor: 'grey.800'
            }
          }}
        >
          <GitHub sx={{ fontSize: 20 }} />
        </IconButton>
        
        <IconButton 
          sx={{ 
            width: 48, 
            height: 48, 
            bgcolor: 'background.paper', 
            border: '1px solid', 
            borderColor: 'grey.300',
            color: 'grey.700',
            '&:hover': {
              bgcolor: 'grey.50'
            }
          }}
        >
          <CustomGoogleButton />
        </IconButton>
        
        <IconButton 
          sx={{ 
            width: 48, 
            height: 48, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'grey.300',
            '&:hover': {
              bgcolor: 'blue.700'
            }
          }}
        >
          <X sx={{ fontSize: 20 }} />
        </IconButton>
      </Box>
    </Stack>
  );
}