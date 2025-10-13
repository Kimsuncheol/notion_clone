import React, { forwardRef } from 'react';
import { TextField, Paper, Box, Button, IconButton } from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { ArrowUpward } from '@mui/icons-material';
import { grayColor2, blackColor1, blueColor1, blueColor3, blueColor2 } from '@/constants/color';
import { AIModel } from './types';

interface AIQuestionInputProps {
  question: string;
  selectedModel: AIModel;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onModelSelectorClick: (event: React.MouseEvent<HTMLElement>) => void;
  onSearch: () => void;
  isBusy: boolean;
}

const AIQuestionInput = forwardRef<HTMLDivElement, AIQuestionInputProps>(function AIQuestionInput(
  {
    question,
    selectedModel,
    onChange,
    onKeyDown,
    onModelSelectorClick,
    onSearch,
    isBusy,
  },
  ref
) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'speed':
        return <SpeedIcon fontSize="small" sx={{ color: '#4ade80' }} />;
      case 'quality':
        return <AutoFixHighIcon fontSize="small" sx={{ color: '#8b5cf6' }} />;
      case 'reasoning':
        return <PsychologyIcon fontSize="small" sx={{ color: '#f59e0b' }} />;
      default:
        return <SmartToyIcon fontSize="small" />;
    }
  };

  const isSendDisabled = isBusy || !question.trim();

  return (
    <Box sx={{ width: '100%', mb: 4 }} ref={ref}>
      <Paper
        sx={{
          width: '100%',
          bgcolor: grayColor2,
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        <TextField
          fullWidth
          multiline
          minRows={1}
          maxRows={4}
          id="ai-question-input"
          placeholder="Ask a question..."
          value={question}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isBusy}
          sx={{
            '& .MuiOutlinedInput-root': {
              border: 'none',
              borderRadius: 3,
              bgcolor: 'transparent',
              color: 'white',
              fontSize: '16px',
              padding: '16px 20px',
              '& fieldset': {
                border: 'none',
              },
              '&:hover fieldset': {
                border: 'none',
              },
              '&.Mui-focused fieldset': {
                border: 'none',
              },
              '&.Mui-disabled': {
                color: 'rgba(255, 255, 255, 0.5)',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              fontSize: '16px',
              padding: 0,
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.6)',
                opacity: 1,
              },
              '&.Mui-disabled': {
                WebkitTextFillColor: 'rgba(255, 255, 255, 0.4)',
              },
            },
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, px: '20px', py: '16px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Button
              onClick={onModelSelectorClick}
              variant="outlined"
              id="model-selector"
              disabled={isBusy}
              sx={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 2,
                minWidth: 'auto',
                textTransform: 'none',
                fontSize: '12px',
                padding: 1,
                mr: 1,
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                },
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&.Mui-disabled': {
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                  color: 'rgba(255, 255, 255, 0.4)',
                },
              }}
            >
              {getCategoryIcon(selectedModel.category)}
              {selectedModel.name}
            </Button>
            <Button
              disabled={isBusy}
              sx={{
                width: 'fit-content',
                height: 'fit-content',
                padding: 0.7,
                minWidth: 'auto',
                boxSizing: 'content-box',
                borderRadius: '50%',
                border: `2px solid ${blueColor1}`,
                textTransform: 'none',
                fontSize: '12px',
                bgcolor: blueColor3,
                '&:hover': {
                  bgcolor: blueColor2,
                },
                '&.Mui-disabled': {
                  opacity: 0.4,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                },
              }}
            >
              <LanguageOutlinedIcon sx={{ color: blueColor1 }} />
            </Button>
          </Box>
          <IconButton
            onClick={onSearch}
            id="search-button"
            disabled={isSendDisabled}
            sx={{
              bgcolor: blackColor1,
              borderRadius: '50%',
              minWidth: 'auto',
              textTransform: 'none',
              fontSize: '12px',
              ml: 1,
              '&:hover': {
                bgcolor: '#1976d2',
              },
              '&:disabled': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            <ArrowUpward sx={{ color: 'white' }} />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
});

export default AIQuestionInput;
