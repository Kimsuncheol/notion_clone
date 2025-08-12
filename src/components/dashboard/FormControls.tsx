'use client';
import React from 'react';
import { Box, IconButton } from '@mui/material';
import { useNoteCreation } from '@/contexts/NoteCreationContext';
import ModeSelector from './ModeSelector';
import ActionButtons from './ActionButtons';
// import GptModelSelector from './GptModelSelector';
import LanguageIcon from '@mui/icons-material/Language';

interface FormControlsProps {
  isUserAuthenticated: boolean;
  onAttachClick: () => void;
  onCreateNewNote: () => void;
  disabled: boolean;
  isGenerating: boolean;
  hideModeSelector?: boolean;
}

const FormControls: React.FC<FormControlsProps> = ({
  isUserAuthenticated,
  onAttachClick,
  onCreateNewNote,
  disabled,
  isGenerating,
  hideModeSelector = false,
}) => {
  const { selectedMode } = useNoteCreation();

  return (
    <Box sx={{ 
      position: 'absolute', 
      bottom: 12, 
      left: 8, 
      right: 8, 
      display: 'flex', 
      alignItems: 'center', 
      gap: 1, 
      justifyContent: 'space-between' 
    }}>
      {!hideModeSelector && <ModeSelector />}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {['ask', 'build'].includes(selectedMode) && (
          <>
            <IconButton
              title="Search for on the web"
              disabled={!isUserAuthenticated || isGenerating}
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
              <LanguageIcon sx={{ fontSize: '16px' }} />
            </IconButton>
            {/* <GptModelSelector /> */}
          </>
        )}
        <ActionButtons
          isUserAuthenticated={isUserAuthenticated}
          onAttachClick={onAttachClick}
          onCreateNewNote={onCreateNewNote}
          disabled={disabled}
        />
      </Box>
    </Box>
  );
};

export default FormControls; 