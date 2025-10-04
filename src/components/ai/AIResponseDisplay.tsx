'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography, type SxProps, type Theme } from '@mui/material';
import AnimatedText from './AnimatedText';

type AIResponseDisplayProps = {
  response: string;
  isLoading: boolean;
  isStreaming?: boolean;
  prompt?: string;
  sx?: SxProps<Theme>;
  onAnimationFinished?: () => void;
};

const SCROLLABLE_MAX_HEIGHT = 320;

function AIResponseDisplayComponent({
  response,
  isLoading,
  isStreaming = false,
  prompt,
  sx,
  onAnimationFinished,
}: AIResponseDisplayProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const hasStreamedRef = useRef(false);

  useEffect(() => {
    if (isStreaming) {
      hasStreamedRef.current = true;
      setShouldAnimate(false);
      return;
    }

    if (!isLoading && !response) {
      hasStreamedRef.current = false;
    }

    if (isLoading) {
      setShouldAnimate(false);
      return;
    }

    if (response) {
      setShouldAnimate(!hasStreamedRef.current);
    }
  }, [isLoading, isStreaming, response]);

  const containerSx: SxProps<Theme> = [
    { width: '100%', mt: 4 },
    ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
  ];

  const showPlaceholder = !response && !isLoading && !isStreaming && !prompt;
  const showSpinner = isLoading && !isStreaming;

  return (
    <Box sx={containerSx} className="no-scrollbar">
      <Box
        sx={{
          bgcolor: 'rgba(7, 11, 23, 0.8)',
          borderRadius: 3,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '24px',
          minHeight: '180px',
          color: 'rgba(255, 255, 255, 0.92)',
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            maxHeight: `${SCROLLABLE_MAX_HEIGHT}px`,
            overflowY: 'auto',
            pr: 1,
            mr: -1,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderRadius: '999px',
            },
          }}
        >
          {prompt && (
            <Typography
              variant="subtitle2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '14px',
                letterSpacing: '0.02em',
              }}
            >
              {prompt}
            </Typography>
          )}

          {showSpinner && (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <CircularProgress size={22} sx={{ color: 'rgba(255, 255, 255, 0.8)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Thinking through a response...
              </Typography>
            </Box>
          )}

          {isStreaming && (
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <CircularProgress size={18} sx={{ color: 'rgba(96, 165, 250, 0.85)' }} />
              <Typography variant="body2" sx={{ color: 'rgba(147, 197, 253, 0.85)' }}>
                Streaming response...
              </Typography>
            </Box>
          )}

          {showPlaceholder && (
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
              Your AI responses will appear here once you ask a question.
            </Typography>
          )}

          {response && (isStreaming || !isLoading) && (
            <Typography
              component="div"
              variant="body1"
              sx={{
                lineHeight: 1.6,
                fontSize: '16px',
                whiteSpace: 'pre-wrap',
              }}
            >
              <AnimatedText
                text={response}
                isActive={shouldAnimate && !isStreaming}
                onAnimationComplete={() => {
                  setShouldAnimate(false);
                  onAnimationFinished?.();
                }}
              />
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const areEqual = (prev: AIResponseDisplayProps, next: AIResponseDisplayProps) =>
  prev.response === next.response &&
  prev.isLoading === next.isLoading &&
  prev.isStreaming === next.isStreaming &&
  prev.prompt === next.prompt &&
  prev.sx === next.sx &&
  prev.onAnimationFinished === next.onAnimationFinished;

export default memo(AIResponseDisplayComponent, areEqual);
