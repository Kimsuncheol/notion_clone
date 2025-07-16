'use client';
import React, { useRef, useState } from 'react';
import { TextField, Box, Typography, IconButton, CircularProgress } from '@mui/material';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import DropzoneOverlay from './DropzoneOverlay';
import ModeSelector from './ModeSelector';
import ActionButtons from './ActionButtons';
import AttachedFilesList from './AttachedFilesList';
import { useNoteCreation } from '@/contexts/NoteCreationContext';
import GptModelSelector from './GptModelSelector';
import LanguageIcon from '@mui/icons-material/Language';
import toast from 'react-hot-toast';

interface CreateNoteFormProps {
  askText: string;
  onAskTextChange: (text: string) => void;
  onCreateNewNote: () => void;
  isUserAuthenticated: boolean;
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
}

interface ParsedData {
  step: string;
  message: string;
  is_complete: boolean;
  process_step: string;
  note_structure: string;
}

// Improved error handling interface based on API documentation
interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

interface APIError {
  detail: ValidationError[] | string;
}

// Enhanced generateText function with better error handling and user feedback
const generateText = async (prompt: string, onProgress?: (isGenerating: boolean) => void): Promise<string | null> => {
  // Input validation
  if (!prompt || typeof prompt !== 'string') {
    toast.error('Please enter a valid prompt');
    return null;
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length === 0) {
    toast.error('Please enter a prompt to generate text');
    return null;
  }

  if (trimmedPrompt.length > 5000) {
    toast.error('Prompt is too long. Please keep it under 5000 characters.');
    return null;
  }

  // Set loading state
  onProgress?.(true);

  // Create a loading toast
  const loadingToast = toast.loading('Generating text...', {
    duration: 60000, // 60 seconds timeout
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 60000); // 60 second timeout

    const response = await fetch('http://127.0.0.1:8000/build', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ prompt: trimmedPrompt }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = 'Failed to generate text';

      try {
        const errorData: APIError = await response.json();

        if (response.status === 422) {
          // Handle validation errors
          if (Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail.map(err => err.msg).join(', ');
            errorMessage = `Validation error: ${validationErrors}`;
          } else if (typeof errorData.detail === 'string') {
            errorMessage = errorData.detail;
          }
        } else if (response.status === 400) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : 'Invalid request';
        } else if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Please wait before making another request.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (parseError) {
        console.error('Error parsing error response:', parseError);
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      console.error('Error from text generation API:', errorMessage);
      toast.error(errorMessage, { id: loadingToast });
      return null;
    }

    const result = await response.text();

    // Validate response
    if (!result || typeof result !== 'string') {
      toast.error('Invalid response from text generation service', { id: loadingToast });
      return null;
    }

    if (result.trim().length === 0) {
      toast.error('Generated text is empty. Please try a different prompt.', { id: loadingToast });
      return null;
    }

    toast.success('Text generated successfully!', { id: loadingToast });
    return result;

  } catch (error) {
    console.error('Failed to communicate with text generation API', error);

    let errorMessage = 'Failed to connect to the text generation service.';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
    }

    toast.error(errorMessage, { id: loadingToast });
    return null;
  } finally {
    onProgress?.(false);
  }
};

// Function to parse key-value pairs from generated text
const parseKeyValueString = (generatedText: string): { [key: string]: string } => {
  const result: { [key: string]: string } = {};

  // Try different parsing strategies based on common formats

  // Strategy 1: Try newline + colon format (key: value)
  if (generatedText.includes('\n') && generatedText.includes(':')) {
    const lines = generatedText.split('\n');
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          result[key] = value;
        }
      }
    });
    if (Object.keys(result).length > 0) return result;
  }

  // Strategy 2: Try comma + colon format (key1:value1,key2:value2)
  if (generatedText.includes(',') && generatedText.includes(':')) {
    const pairs = generatedText.split(',');
    pairs.forEach(pair => {
      const [key, value] = pair.split(':');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });
    if (Object.keys(result).length > 0) return result;
  }

  // Strategy 3: Try newline + equals format (key=value)
  if (generatedText.includes('\n') && generatedText.includes('=')) {
    const lines = generatedText.split('\n');
    lines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) {
        result[key.trim()] = value.trim();
      }
    });
    if (Object.keys(result).length > 0) return result;
  }

  // Strategy 4: Try JSON format
  try {
    const jsonResult = JSON.parse(generatedText);
    if (typeof jsonResult === 'object' && jsonResult !== null) {
      return jsonResult;
    }
  } catch {
    // Not JSON, continue with other strategies
  }

  // If no parsing strategy worked, return the original text as a single value
  return { content: generatedText };
};

const CreateNoteForm: React.FC<CreateNoteFormProps> = ({
  askText,
  onAskTextChange,
  // onCreateNewNote,
  isUserAuthenticated,
  onFilesSelect,
  selectedFiles,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
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
          console.log(`Key: ${key}, Value: ${value}`);
        });

        // Set the original text or formatted text based on your needs
        // onAskTextChange(generatedText);
        // onAskTextChange(trimmedGeneratedText);
        // onAskTextChange(trimmedGeneratedText);

        // Or if you want to format it differently:
        const formattedText = Object.entries(parsedData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');

        if (trimmedGeneratedText.includes('is_complete')) {
          console.log('1234567890');
          onAskTextChange(formattedText['step']);
        } else {
          // onCreateNewNote();
        }
      }
    } else {
      // onCreateNewNote();
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
        <TextField
          fullWidth
          variant="outlined"
          placeholder={isDragActive ? "Drop files to attach..." : "Ask or describe what you want to create..."}
          value={askText}
          onKeyDown={handleKeyDown}
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
              disabled={isGenerating}
            />
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
                <GptModelSelector />
              </>
            )}
            <ActionButtons
              isUserAuthenticated={isUserAuthenticated}
              onAttachClick={handleAttachClick}
              onCreateNewNote={handleCreateOrGenerate}
              disabled={isGenerating || isPromptTooLong}
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