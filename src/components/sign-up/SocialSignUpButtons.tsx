'use client';
import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  CircularProgress
} from '@mui/material';
import { GitHub, X } from '@mui/icons-material';
import CustomGoogleButton from '../CustomGoogleButton';

interface SocialSignUpButtonsProps {
  onGoogleClick?: () => void;
  isGoogleLoading?: boolean;
}

export default function SocialSignUpButtons({
  onGoogleClick,
  isGoogleLoading = false,
}: SocialSignUpButtonsProps) {
  return (
    <Stack sx={{ width: '100%', display: 'flex', gap: 0 }}>
      <Typography variant="body2" sx={{ color: 'white', mb: 2 }}>
        Sign up with social account
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
          onClick={onGoogleClick}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? <CircularProgress size={20} sx={{ color: 'grey.700' }} /> : <CustomGoogleButton />}
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
