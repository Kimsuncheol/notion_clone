import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Link from 'next/link';
import { mintColor1 } from '@/constants/color';

export default function SeriesNotFound() {
  return (
    <Box sx={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px',
      backgroundColor: '#1a1a1a',
      minHeight: '80vh',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold', 
          marginBottom: '16px',
          color: 'white'
        }}
      >
        시리즈를 찾을 수 없습니다
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: '#b0b0b0', 
          marginBottom: '32px',
          maxWidth: '500px'
        }}
      >
        요청하신 시리즈가 존재하지 않거나 삭제되었을 수 있습니다.
      </Typography>
      
      <Link href="/trending/week" passHref>
        <Button
          variant="contained"
          sx={{
            backgroundColor: mintColor1,
            color: 'black',
            fontWeight: 'bold',
            padding: '12px 24px',
            borderRadius: '8px',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: mintColor1,
              opacity: 0.9
            }
          }}
        >
          홈으로 돌아가기
        </Button>
      </Link>
    </Box>
  );
}
