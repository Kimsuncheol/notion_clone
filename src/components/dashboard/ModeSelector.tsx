'use client';
import React from 'react';
import { Box, Button } from '@mui/material';
import {
  useNoteCreation,
  NoteCreationMode,
} from '@/contexts/NoteCreationContext';

const modes: NoteCreationMode[] = ['ask', 'research', 'build'];

const ModeSelector: React.FC = () => {
  const { selectedMode, setSelectedMode } = useNoteCreation();

  const handleModeSelect = (mode: NoteCreationMode) => {
    setSelectedMode(mode);
  };

  const getButtonStyles = (mode: NoteCreationMode) => {
    const isSelected = selectedMode === mode;
    return {
      backgroundColor: isSelected ? '#374151' : 'transparent',
      color: isSelected ? '#FFFFFF' : '#9CA3AF',
      borderRadius: '6px',
      padding: '4px 12px',
      textTransform: 'capitalize' as const,
      minWidth: 'auto',
      fontWeight: '500',
      fontSize: '14px',
      lineHeight: '20px',
      '&:hover': {
        backgroundColor: isSelected ? '#4B5563' : '#374151',
      },
    };
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#1F2937',
        borderRadius: '8px',
        p: '4px',
        gap: '4px',
      }}
    >
      {modes.map(mode => (
        <Button
          key={mode}
          onClick={() => handleModeSelect(mode)}
          sx={getButtonStyles(mode)}
        >
          {mode}
        </Button>
      ))}
    </Box>
  );
};

export default ModeSelector; 