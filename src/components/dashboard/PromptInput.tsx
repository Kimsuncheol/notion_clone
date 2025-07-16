'use client';
import React from 'react';
import { TextField, Box, CircularProgress, Typography } from '@mui/material';
import { useNoteCreation } from '@/contexts/NoteCreationContext';

interface PromptInputProps {
  askText: string;
  onAskTextChange: (text: string) => void;
  rows: number;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  isGenerating: boolean;
  isDragActive: boolean;
}

const PromptInput: React.FC<PromptInputProps> = ({
  askText,
  onAskTextChange,
  rows,
  onKeyDown,
  isGenerating,
  isDragActive,
}) => {
  const { selectedMode } = useNoteCreation();

  // Character count for prompt validation
  const promptLength = askText.length;
  const isPromptTooLong = promptLength > 5000;

  return (
    <Box sx={{ position: 'relative', height: '120px' }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={isDragActive ? "Drop files to attach..." : "Ask or describe what you want to create..."}
        value={askText}
        onKeyDown={onKeyDown}
        onChange={(e) => onAskTextChange(e.target.value)}
        multiline
        rows={rows}
        disabled={isGenerating}
        error={isPromptTooLong}
        inputProps={{
          style: {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            paddingBottom: '24px',
          },
        }}
        helperText={
          isPromptTooLong ?
            `Character limit exceeded: ${promptLength}/5000` :
            selectedMode === 'build' && promptLength > 0 ?
              `${promptLength}/5000 characters` :
              undefined
        }
        sx={{
          height: '120px',
          position: 'absolute',
          bottom: 12,
          left: 0,
          right: 0,
          top: 0,
          '& .MuiOutlinedInput-root': {
            color: 'white',
            fontSize: '1.0rem',
            paddingRight: '60px',
            '& fieldset': {
              border: 'none',
            },
            '&:hover fieldset': {
              border: 'none',
            },
            '&.Mui-focused fieldset': {
              border: 'none',
            },
            '& textarea::placeholder': {
              color: '#a0aec0',
              opacity: 1,
            },
            '&.Mui-disabled': {
              color: '#9ca3af',
            },
          },
          '& .MuiFormHelperText-root': {
            color: isPromptTooLong ? '#ef4444' : '#6b7280',
            fontSize: '0.75rem',
            marginTop: 1,
          },
        }}
      />

      {/* Loading indicator overlay */}
      {isGenerating && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            backdropFilter: 'blur(1px)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: '#3b82f6' }} />
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              Generating...
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PromptInput; 