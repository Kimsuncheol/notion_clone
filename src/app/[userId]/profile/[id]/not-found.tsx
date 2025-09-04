'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Avatar, Button, Typography } from '@mui/material';
import { blackColor1, grayColor2, grayColor3 } from '@/constants/color';

export default function NotFound() {
  const router = useRouter();

  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      id='profile-page-not-found'
      style={{ backgroundColor: blackColor1 }}
    >
      <div className="text-center max-w-md mx-auto px-6">
        <div 
          className="mb-8 w-32 h-32 mx-auto rounded-full flex items-center justify-center"
          style={{ backgroundColor: grayColor2 }}
        >
          <Avatar 
            sx={{ 
              width: 80, 
              height: 80, 
              backgroundColor: grayColor3,
              color: blackColor1,
              fontSize: '2rem'
            }}
          >
            ?
          </Avatar>
        </div>
        
        <Typography 
          variant="h4" 
          className="font-bold mb-3"
          sx={{ color: grayColor3 }}
        >
          User Not Found
        </Typography>
        
        <Typography 
          variant="body1" 
          className="mb-8"
          sx={{ color: grayColor3, opacity: 0.8 }}
        >
          The profile you're looking for doesn't exist or may have been removed.
        </Typography>
        
        <div className="space-y-3">
          <Button
            variant="contained"
            onClick={() => router.push('/dashboard')}
            size="large"
            sx={{ 
              mt: 2, 
              textTransform: 'none',
              backgroundColor: grayColor3,
              color: blackColor1,
              fontWeight: 'bold',
              borderRadius: '12px',
              padding: '12px 32px',
              fontSize: '1rem',
              '&:hover': {
                backgroundColor: grayColor3,
                opacity: 0.9,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            Return to Dashboard
          </Button>
          
          <div>
            <Button
              variant="outlined"
              onClick={() => router.back()}
              size="medium"
              sx={{ 
                textTransform: 'none',
                borderColor: grayColor3,
                color: grayColor3,
                borderRadius: '12px',
                padding: '8px 24px',
                '&:hover': {
                  borderColor: grayColor3,
                  backgroundColor: `${grayColor3}20`,
                },
              }}
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}