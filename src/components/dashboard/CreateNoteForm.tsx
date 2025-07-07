'use client';
import React, { useRef, useState } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import DropzoneOverlay from './DropzoneOverlay';
import ModeSelector from './ModeSelector';
import ActionButtons from './ActionButtons';
import AttachedFilesList from './AttachedFilesList';
import { useNoteCreation } from '@/contexts/NoteCreationContext';
import GptModelSelector from './GptModelSelector';

interface CreateNoteFormProps {
  askText: string;
  onAskTextChange: (text: string) => void;
  onCreateNewNote: () => void;
  isUserAuthenticated: boolean;
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
}

const CreateNoteForm: React.FC<CreateNoteFormProps> = ({
  askText,
  onAskTextChange,
  onCreateNewNote,
  isUserAuthenticated,
  onFilesSelect,
  selectedFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(4);
  const { selectedMode } = useNoteCreation();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop: (item: { files: File[] }) => {
      if (item.files && item.files.length > 0) {
        const supportedFiles = item.files.filter(file =>
          file.type.startsWith('image/') || file.type === 'application/pdf'
        );

        if (supportedFiles.length > 0) {
          const newFiles = [...selectedFiles, ...supportedFiles];
          onFilesSelect(newFiles);
        }
      }
    },
    canDrop: () => isUserAuthenticated,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drop(dropRef);

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      const supportedFiles = files.filter(file =>
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );

      if (supportedFiles.length > 0) {
        const newFiles = [...selectedFiles, ...supportedFiles];
        onFilesSelect(newFiles);
      }
    }

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveFile = (fileToRemove: File) => {
    const updatedFiles = selectedFiles.filter(file => file !== fileToRemove);
    onFilesSelect(updatedFiles);
  };

  const handleRemoveAllFiles = () => {
    onFilesSelect([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCreateNewNote();
    }
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setRows(rows + 1);
    }
    if (e.key === 'Backspace' && askText.length === 0 && rows > 3) {
      e.preventDefault();
      setRows(rows - 1);
    }
  };

  const isDragActive = isOver && canDrop;

  return (
    <Box
      ref={dropRef}
      sx={{
        mb: 4,
        position: 'relative',
        transition: 'all 0.3s ease',
        ...(isDragActive && {
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '12px',
          border: '2px dashed #3b82f6',
        }),
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }}>
        What would you like to create today?
      </Typography>

      <DropzoneOverlay isDragActive={isDragActive} />

      <Box sx={{ position: 'relative', maxWidth: '100%', mx: 'auto' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder={isDragActive ? "Drop files to attach..." : "Ask or describe what you want to create..."}
          value={askText}
          onKeyDown={handleKeyDown}
          onChange={(e) => onAskTextChange(e.target.value)}
          multiline
          rows={rows}
          sx={{
            '& .MuiOutlinedInput-root': {
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
              '& textarea::placeholder': {
                color: '#a0aec0',
                opacity: 1,
              },
            },
          }}
        />
        <Box sx={{ position: 'absolute', bottom: 12, left: 8, right: 8, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <ModeSelector />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <input
              type="file"
              title="Attach files"
              multiple
              accept="image/*,.pdf"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            {['ask', 'build'].includes(selectedMode) && <GptModelSelector />}
            <ActionButtons
              isUserAuthenticated={isUserAuthenticated}
              onAttachClick={handleAttachClick}
              onCreateNewNote={onCreateNewNote}
            />
          </Box>
        </Box>
      </Box>

      <AttachedFilesList
        selectedFiles={selectedFiles}
        onRemoveFile={handleRemoveFile}
        onRemoveAllFiles={handleRemoveAllFiles}
      />

      {!isUserAuthenticated && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Please sign in to create notes
        </Typography>
      )}
    </Box>
  );
};

export default CreateNoteForm; 