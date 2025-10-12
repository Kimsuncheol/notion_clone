import React, { forwardRef } from 'react';
import { TextField, Paper, Box, IconButton } from '@mui/material';
import { ArrowUpward } from '@mui/icons-material';
import { grayColor2, blackColor1 } from '@/constants/color';

interface AIQuestionInputForMarkdownAIChatModalProps {
  question: string;
  onChange: (value: string) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSearch: () => void;
  isBusy: boolean;
}

const AIQuestionInputForMarkdownAIChatModal = forwardRef<HTMLDivElement, AIQuestionInputForMarkdownAIChatModalProps>(
  function AIQuestionInputForMarkdownAIChatModal(
    {
      question,
      onChange,
      onKeyPress,
      onSearch,
      isBusy,
    },
    ref
  ) {
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
            placeholder="Ask a question about markdown..."
            value={question}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
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
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1, px: '20px', py: '16px' }}>
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
  }
);

export default AIQuestionInputForMarkdownAIChatModal;
