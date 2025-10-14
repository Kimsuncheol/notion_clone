import React, { forwardRef } from 'react';
import { TextField, Paper, Box, Button, IconButton } from '@mui/material';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { ArrowUpward } from '@mui/icons-material';
import { grayColor2, blackColor1, blueColor1, blueColor3, blueColor2 } from '@/constants/color';
import { useAIStore } from '@/store/aiStore';

interface AIQuestionInputProps {
  question: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onSearch: () => void;
  isBusy: boolean;
}

const AIQuestionInput = forwardRef<HTMLDivElement, AIQuestionInputProps>(function AIQuestionInput(
  {
    question,
    onChange,
    onKeyDown,
    onSearch,
    isBusy,
  },
  ref
) {
  const isSendDisabled = isBusy || !question.trim();
  const webSearchMode = useAIStore((state) => state.webSearchMode);
  const toggleWebSearchMode = useAIStore((state) => state.toggleWebSearchMode);

  const handleWebSearchToggle = () => {
    if (isBusy) {
      return;
    }
    toggleWebSearchMode();
  };

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
              disabled={isBusy}
              onClick={handleWebSearchToggle}
              sx={{
                width: 'fit-content',
                height: 'fit-content',
                padding: 0.7,
                minWidth: 'auto',
                boxSizing: 'content-box',
                borderRadius: '50%',
                border: `2px solid ${webSearchMode ? '#60a5fa' : blueColor1}`,
                textTransform: 'none',
                fontSize: '12px',
                bgcolor: webSearchMode ? 'rgba(96, 165, 250, 0.35)' : blueColor3,
                '&:hover': {
                  bgcolor: webSearchMode ? 'rgba(96, 165, 250, 0.45)' : blueColor2,
                },
                '&.Mui-disabled': {
                  opacity: 0.4,
                  borderColor: 'rgba(255, 255, 255, 0.12)',
                },
              }}
            >
              <LanguageOutlinedIcon sx={{ color: webSearchMode ? '#bfdbfe' : blueColor1 }} />
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
