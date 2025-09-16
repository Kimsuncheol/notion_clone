'use client';
import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import AIHeader from '@/components/ai/AIHeader';
import AIQuestionInput from '@/components/ai/AIQuestionInput';
import AIModelSelector from '@/components/ai/AIModelSelector';
import { AIModel, aiModels } from '@/components/ai/types';

export default function AIPage() {
  const [question, setQuestion] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleModelSelectorClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model);
    handleMenuClose();
  };

  const handleSearch = () => {
    if (question.trim()) {
      // Here you would implement the search/chat functionality
      console.log('Searching with:', question);
      console.log('Using model:', selectedModel);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Box 
      className="min-h-screen"
      sx={{ 
        backgroundColor: 'transparent',
        color: 'white'
      }}
    >
      <Container maxWidth="md" className="px-4 py-8">
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            textAlign: 'center'
          }}
        >
          <AIHeader />
          
          <AIQuestionInput 
            question={question}
            selectedModel={selectedModel}
            onChange={setQuestion}
            onKeyPress={handleKeyPress}
            onModelSelectorClick={handleModelSelectorClick}
            onSearch={handleSearch}
          />

          <AIModelSelector 
            anchorEl={anchorEl}
            isOpen={isMenuOpen}
            models={aiModels}
            selectedModel={selectedModel}
            onClose={handleMenuClose}
            onModelSelect={handleModelSelect}
          />
        </Box>
      </Container>
    </Box>
  );
}
