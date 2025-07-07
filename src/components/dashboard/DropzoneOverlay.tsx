'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

interface DropzoneOverlayProps {
  isDragActive: boolean;
}

const DropzoneOverlay: React.FC<DropzoneOverlayProps> = ({ isDragActive }) => {
  if (!isDragActive) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderRadius: '12px',
        border: '2px dashed #3b82f6',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
        <ImageIcon sx={{ color: '#3b82f6', fontSize: '24px' }} />
        <PictureAsPdfIcon sx={{ color: '#3b82f6', fontSize: '24px' }} />
      </Box>
      <Typography
        variant="h6"
        sx={{
          color: '#3b82f6',
          fontWeight: 'bold',
          textAlign: 'center',
          px: 2,
        }}
      >
        Drop your images or PDF files here
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: '#3b82f6',
          textAlign: 'center',
          px: 2,
          mt: 0.5,
        }}
      >
        Supports: JPG, PNG, GIF, WebP, PDF
      </Typography>
    </Box>
  );
};

export default DropzoneOverlay; 