'use client';
import React from 'react';
import { Box, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface ActionButtonsProps {
  isUserAuthenticated: boolean;
  onAttachClick: () => void;
  onCreateNewNote: () => void;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isUserAuthenticated,
  onAttachClick,
  onCreateNewNote,
  disabled = false,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <IconButton
        onClick={onAttachClick}
        disabled={!isUserAuthenticated || disabled}
        sx={{
          borderRadius: '50%',
          p: 1,
          color: 'white',
          backgroundColor: '#6b7280',
          '&:hover': {
            backgroundColor: '#4b5563',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            color: '#666',
          },
        }}
      >
        <AttachFileIcon sx={{ fontSize: '16px' }} />
      </IconButton>
      <IconButton
        onClick={onCreateNewNote}
        disabled={!isUserAuthenticated || disabled}
        sx={{
          borderRadius: '50%',
          p: 1,
          fontSize: '12px',
          color: 'white',
          backgroundColor: 'skyblue',
          '&:hover': {
            backgroundColor: 'blue',
          },
          '&:disabled': {
            backgroundColor: '#ccc',
            color: '#666',
          },
        }}
      >
        <ArrowUpwardIcon sx={{ fontSize: '16px' }} />
      </IconButton>
    </Box>
  );
};

export default ActionButtons; 