'use client';
import React from 'react';
import {
  Box,
  Typography,
  Button
} from '@mui/material';

interface SignUpPromptProps {
  onSignUp: () => void;
}

export default function SignUpPrompt({ onSignUp }: SignUpPromptProps) {
  return (
    <Box>
      <Typography variant="body2" sx={{ color: 'white' }}>
        Not a member yet?{' '}
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
          onClick={onSignUp}
        >
          Sign up
        </Button>
      </Typography>
    </Box>
  );
}