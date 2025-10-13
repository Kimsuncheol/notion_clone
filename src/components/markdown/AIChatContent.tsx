'use client';

import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import AIHeader from '../ai/AIHeader';
import AIResponseDisplay from '../ai/AIResponseDisplay';
import AIQuestionInputForMarkdownAIChatModal from './AIQuestionInputForMarkdownAIChatModal';

type ConversationEntry = {
  id: number;
  prompt: string;
  response: string;
  isLoading: boolean;
};

interface AIChatContentProps {
  responses: ConversationEntry[];
  question: string;
  onQuestionChange: (question: string) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  onSearch: () => void;
  isBusy: boolean;
  userAvatarUrl?: string;
  userDisplayName?: string;
  responseContainerRef: React.RefObject<HTMLDivElement | null>;
  onAnimationFinished?: (responseId: number) => void;
  latestResponseId: number | null;
}

export default function AIChatContent({
  responses,
  question,
  onQuestionChange,
  onKeyPress,
  onSearch,
  isBusy,
  userAvatarUrl,
  userDisplayName,
  responseContainerRef,
  onAnimationFinished,
  latestResponseId,
}: AIChatContentProps) {
  const shouldShowResponse = responses.length > 0;
  const stackedResponseStyle = useMemo<React.CSSProperties>(() => ({ marginTop: 0 }), []);

  return (
    <>
      <Box
        ref={responseContainerRef}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: shouldShowResponse ? 'flex-start' : 'center',
          gap: shouldShowResponse ? 3 : 4,
          width: '100%',
          overflowY: 'auto',
          pr: 1,
          mr: -1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '4px',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)',
            },
          },
        }}
      >
        {shouldShowResponse ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {responses.map((entry) => (
              <AIResponseDisplay
                key={entry.id}
                response={entry.response}
                isLoading={entry.isLoading}
                prompt={entry.prompt}
                style={stackedResponseStyle}
                userAvatarUrl={userAvatarUrl}
                userDisplayName={userDisplayName}
                onAnimationFinished={
                  !entry.isLoading && latestResponseId === entry.id && onAnimationFinished
                    ? () => onAnimationFinished(entry.id)
                    : undefined
                }
              />
            ))}
          </Box>
        ) : (
          <AIHeader />
        )}
      </Box>

      <Box sx={{ width: '100%', pt: shouldShowResponse ? 1 : 0 }}>
        <AIQuestionInputForMarkdownAIChatModal
          question={question}
          onChange={onQuestionChange}
          onKeyPress={onKeyPress}
          onSearch={onSearch}
          isBusy={isBusy}
        />
      </Box>
    </>
  );
}
