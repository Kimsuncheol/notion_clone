'use client';
import React from 'react';
import { TextField, Box, Typography, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AttachFileIcon from '@mui/icons-material/AttachFile';

interface CreateNoteFormProps {
  askText: string;
  onAskTextChange: (text: string) => void;
  onCreateNewNote: () => void;
  isUserAuthenticated: boolean;
}

const CreateNoteForm: React.FC<CreateNoteFormProps> = ({
  askText,
  onAskTextChange,
  onCreateNewNote,
  isUserAuthenticated,
}) => {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        What would you like to create today?
      </Typography>
      <Box sx={{ position: 'relative', maxWidth: '100%', mx: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Ask or describe what you want to create..."
          value={askText}
          onChange={(e) => onAskTextChange(e.target.value)}
          multiline
          rows={4}
          sx={{
            '& .MuiOutlinedInput-root': {
              // backgroundColor: '#4a5568',
              color: 'white',
              borderBottom: '1px solid #a0aec0',
              borderRadius: '10px',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none', 
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
              '& input::placeholder': {
                color: '#a0aec0',
                opacity: 1,
              },
              '& textarea::placeholder': {
                color: '#a0aec0',
                opacity: 1,
              },
            },
          }}
        />
        <Box sx={{ position: 'absolute', bottom: 8, right: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Attach file button */}
          <IconButton
            onClick={onCreateNewNote}
            disabled={!isUserAuthenticated}
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
            <AttachFileIcon sx={{ fontSize: '16px' }} />
          </IconButton>
          {/* Ask button */}
          <IconButton
            onClick={onCreateNewNote}
            disabled={!isUserAuthenticated}
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
      </Box>
      {!isUserAuthenticated && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Please sign in to create notes
        </Typography>
      )}
    </Box>
  );
};

export default CreateNoteForm; 