'use client';
import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { useNoteCreation, NoteCreationMode } from '@/contexts/NoteCreationContext';

const modes: NoteCreationMode[] = ['ask', 'build', 'research'];

const ModeSelector: React.FC = () => {
  const { selectedMode, setSelectedMode } = useNoteCreation();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
      {modes.map(mode => (
        <IconButton key={mode} onClick={() => setSelectedMode(mode)}>
          <Typography
            variant="body2"
            sx={{
              color: selectedMode === mode ? '#ffffff' : '#a0aec0',
              backgroundColor: selectedMode === mode ? '#3b82f6' : '#4a5568',
              borderRadius: '10px',
              padding: '8px 12px',
              transition: 'all 0.2s ease-in-out',
              textTransform: 'capitalize',
              '&:hover': {
                backgroundColor: selectedMode === mode ? '#2563eb' : '#5a6678',
              },
            }}
          >
            {mode}
          </Typography>
        </IconButton>
      ))}
    </Box>
  );
};

export default ModeSelector; 