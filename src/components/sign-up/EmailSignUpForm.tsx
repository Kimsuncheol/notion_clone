'use client';
import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack
} from '@mui/material';
import { mintColor1, mintColor2 } from '@/constants/color';

interface EmailSignUpFormProps {
  email: string;
  isLoading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EmailSignUpForm({
  email,
  isLoading,
  onEmailChange,
  onSubmit
}: EmailSignUpFormProps) {
  return (
    <Stack spacing={3} sx={{ width: '70%' }}>
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>
          Sign up
        </Typography>
        <Typography variant="body2" sx={{ color: 'white' }}>
          Create an account to get started
        </Typography>
      </Box>

      <form onSubmit={onSubmit} style={{ width: '100%' }}>
        <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0 }}>
          <TextField
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            fullWidth
            variant="outlined"
            required
            disabled={isLoading}
            sx={{
              width: '70%',
              border: '1px solid #ffffff',
              '& .MuiOutlinedInput-root': {
                color: 'white',
                borderRadius: 0,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                }
              }
            }}
          />
          
          <Button 
            type="submit"
            variant="contained" 
            fullWidth 
            size="large"
            disabled={isLoading || !email.trim()}
            sx={{ 
              width: 'fit-content',
              borderRadius: 0, 
              boxShadow: 'none',
              fontSize: '16px',
              py: '15px',
              px: '16px',
              bgcolor: mintColor1,
              color: 'black',
              '&:hover': {
                bgcolor: mintColor2
              },
              '&:disabled': {
                bgcolor: 'rgba(255,255,255,0.3)',
                color: 'rgba(0,0,0,0.5)'
              }
            }}
          >
            {isLoading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </Box>
            ) : (
              'Sign up'
            )}
          </Button>
        </Box>
      </form>
    </Stack>
  );
}