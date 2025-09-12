'use client';
import React from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';

interface SignInPromptProps {
  onSignIn: () => void;
}

export default function SignInPrompt({ onSignIn }: SignInPromptProps) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'white' }}>
        Already have an account?{' '}
        <Button 
          variant="text" 
          size="small"
          sx={{ 
            color: 'primary.main',
            fontWeight: 500,
            minWidth: 'auto',
            p: 0,
            '&:hover': {
              color: 'primary.dark',
              bgcolor: 'transparent'
            }
          }}
          onClick={onSignIn}
        >
          Login
        </Button>
      </Typography>
    </Box>
  );
}