'use client';
import React, { forwardRef } from 'react';
import { TextField, Box, CircularProgress, Typography } from '@mui/material';
import { useNoteCreation } from '@/contexts/NoteCreationContext';

interface PromptInputProps {
  askText: string;
  onAskTextChange: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isGenerating: boolean;
  isDragActive: boolean;
  ref: React.RefObject<HTMLTextAreaElement>;
}

const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(({
  askText,
  onAskTextChange,
  onKeyDown,
  isGenerating,
  isDragActive,
}, ref) => {
  const { selectedMode } = useNoteCreation();

  // Character count for prompt validation
  const promptLength = askText.length;
  const isPromptTooLong = promptLength > 5000;

  return (
    <Box sx={{ position: 'relative', height: '100%' }} id="prompt-input-box">
      <TextField
        fullWidth
        variant="outlined"
        placeholder={isDragActive ? "Drop files to attach..." : "Ask or describe what you want to create..."}
        value={askText}
        onChange={(e) => onAskTextChange(e.target.value)}
        multiline
        id="prompt-input-textarea"
        rows={4}
        disabled={isGenerating}
        error={isPromptTooLong}
        inputRef={ref}
        inputProps={{
          onKeyDown: onKeyDown,
          style: {
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          },
        }}
        FormHelperTextProps={{
          sx: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            top: '90%',
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
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          overflow: 'hidden',
          '& .MuiBox-root': {
            height: '100%',
            overflow: 'hidden',
          },
          '& .MuiOutlinedInput-root': {
            height: '100%',
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
});

PromptInput.displayName = 'PromptInput';

export default PromptInput; 