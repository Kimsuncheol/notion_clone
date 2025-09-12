'use client';
import React from 'react';
import {
  Backdrop,
  Paper,
  Box,
  Typography,
  IconButton,
  Button,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { blackColor3, grayColor2, mintColor1 } from '@/constants/color';

interface SignUpConfirmationProps {
  email: string;
  isLoading: boolean;
  onClose: () => void;
  onResendLink: () => void;
  onUseDifferentEmail: () => void;
}

export default function SignUpConfirmation({
  email,
  isLoading,
  onClose,
  onResendLink,
  onUseDifferentEmail
}: SignUpConfirmationProps) {
  return (
    <Backdrop open sx={{ zIndex: 1300, backgroundColor: blackColor3 }}>
      <Paper 
        sx={{ 
          width: '100%', 
          maxWidth: 500, 
          borderRadius: 4, 
          position: 'relative',
          mx: 2,
          p: 4,
          bgcolor: grayColor2,
          color: 'white',
        }}
        id="sign-up-modal"
      >
        <IconButton 
          sx={{ 
            position: 'absolute', 
            top: 16, 
            right: 16, 
          }}
          onClick={onClose}
        >
          <CloseIcon sx={{ fontSize: 24, color: 'white' }} />
        </IconButton>

        <Box sx={{ textAlign: 'center' }}>
          <Box sx={{ fontSize: '60px', mb: 2 }}>🎉</Box>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Welcome aboard!
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
            We sent a sign-up link to:
          </Typography>
          <Typography variant="body1" sx={{ color: mintColor1, fontWeight: 500, mb: 3 }}>
            {email}
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
            Click the link in your email to complete your account setup. The link will expire in 1 hour.
          </Typography>
          
          <Stack spacing={2}>
            <Button
              onClick={onResendLink}
              disabled={isLoading}
              variant="outlined"
              sx={{ 
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: mintColor1,
                  color: mintColor1
                }
              }}
            >
              {isLoading ? 'Sending...' : 'Resend link'}
            </Button>
            
            <Button
              onClick={onUseDifferentEmail}
              sx={{ color: 'rgba(255,255,255,0.7)', textTransform: 'none' }}
            >
              Use different email
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Backdrop>
  );
}