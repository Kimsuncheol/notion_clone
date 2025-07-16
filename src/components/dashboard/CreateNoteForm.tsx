'use client';
import React, { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import DropzoneOverlay from './DropzoneOverlay';
import AttachedFilesList from './AttachedFilesList';
import PromptInput from './PromptInput';
import FormControls from './FormControls';
import { useNoteCreation } from '@/contexts/NoteCreationContext';
import { generateText, parseKeyValueString } from '@/services/textGeneration';
import { useNoteCreation as useNoteCreationHook } from '@/hooks/useNoteCreation';

interface CreateNoteFormProps {
  askText: string;
  onAskTextChange: (text: string) => void;
  isUserAuthenticated: boolean;
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
}

const CreateNoteForm: React.FC<CreateNoteFormProps> = ({
  askText,
  onAskTextChange,
  isUserAuthenticated,
  onFilesSelect,
  selectedFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const { selectedMode } = useNoteCreation();
  const { createNote } = useNoteCreationHook();

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

  const handleCreateOrGenerate = async () => {
    if (isGenerating) return; // Prevent multiple simultaneous requests

    if (selectedMode === 'build') {
      const generatedText = await generateText(askText, setIsGenerating);
      if (generatedText) {
        console.log('type of generatedText', typeof generatedText);
        const trimmedGeneratedText = generatedText.toString().replace('{', '').replace('}', '');
        
        // Parse the generated text into key-value pairs
        const parsedData = parseKeyValueString(trimmedGeneratedText);
        console.log('Parsed key-value pairs:', parsedData);

        // You can now access individual keys and values
        Object.entries(parsedData).forEach(([key, value]) => {
          console.log(`Key: ${key}, Value: ${value}, type of value: ${typeof value}`);
        });

        // Or if you want to format it differently:
        console.log('type of parsedData', typeof parsedData);

        const keys = Object.keys(parsedData);
        const values = Object.values(parsedData);
        console.log('keys', keys);
        console.log('values', values);

        if (values[3] === 'false') {
          onAskTextChange(values[1].replace('"', ''));
        } else {
          // If the process is complete, create a new note
          console.log('process is complete, creating a new note');
          createNote(askText, isUserAuthenticated);
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating) {
        handleCreateOrGenerate();
      }
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

  // Character count for prompt validation
  const promptLength = askText.length;
  const isPromptTooLong = promptLength > 5000;

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
      <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 1 }} id='create-note-form-title'>
        What would you like to create today?
      </Typography>

      <DropzoneOverlay isDragActive={isDragActive} />

      <Box sx={{
        position: 'relative',
        width: '100%',
        height: '140px',
        boxSizing: 'content-box',
        mx: 'auto',
        paddingBottom: '40px',
        paddingTop: '12px',
        borderBottom: '1px solid #a0aec0',
        borderRadius: '10px',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
      }}>
        <PromptInput
          askText={askText}
          onAskTextChange={onAskTextChange}
          rows={rows}
          onKeyDown={handleKeyDown}
          isGenerating={isGenerating}
          isDragActive={isDragActive}
        />

        <input
          type="file"
          title="Attach files"
          multiple
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isGenerating}
        />

        <FormControls
          isUserAuthenticated={isUserAuthenticated}
          onAttachClick={handleAttachClick}
          onCreateNewNote={handleCreateOrGenerate}
          disabled={isGenerating || isPromptTooLong}
          isGenerating={isGenerating}
        />
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