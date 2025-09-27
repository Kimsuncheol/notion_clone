"use client";

import React, { useCallback, useEffect, useState } from 'react';
import { Button, ClickAwayListener, Paper, Stack } from '@mui/material';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import GTranslateOutlinedIcon from '@mui/icons-material/GTranslateOutlined';

type SelectionPosition = {
  top: number;
  left: number;
  text: string;
};

export default function ActionsAfterTextSelection() {
  const [selection, setSelection] = useState<SelectionPosition | null>(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
  }, []);

  const handleSelectionChange = useCallback(() => {
    const selectionObj = window.getSelection();
    if (!selectionObj || selectionObj.rangeCount === 0) {
      return;
    }

    const selectedText = selectionObj.toString().trim();
    if (!selectedText) {
      clearSelection();
      return;
    }

    const range = selectionObj.getRangeAt(0);
    const boundingRect = range.getBoundingClientRect();
    const rects = range.getClientRects();

    if (!rects.length || (boundingRect.width === 0 && boundingRect.height === 0)) {
      clearSelection();
      return;
    }

    const referenceRect = boundingRect.width || boundingRect.height ? boundingRect : rects[0];
    const top = window.scrollY + referenceRect.top;
    const left = window.scrollX + referenceRect.left + referenceRect.width / 2;

    setSelection({
      top: Math.max(top, 0),
      left,
      text: selectedText,
    });
  }, [clearSelection]);

  useEffect(() => {
    const handleMouseUp = () => {
      requestAnimationFrame(() => handleSelectionChange());
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        clearSelection();
        return;
      }
      handleSelectionChange();
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [clearSelection, handleSelectionChange]);

  const handleCopy = useCallback(async () => {
    if (!selection?.text) return;
    try {
      await navigator.clipboard.writeText(selection.text);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  }, [selection]);

  const handleAnswer = useCallback(() => {
    // Placeholder for future AI implementation
    console.info('Answer action triggered for selected text.');
  }, []);

  const handleTranslate = useCallback(() => {
    // Placeholder for future translation implementation
    console.info('Translate action triggered for selected text.');
  }, []);

  if (!selection) {
    return null;
  }

  return (
    <ClickAwayListener onClickAway={clearSelection}>
      <Paper
        elevation={4}
        sx={{
          position: 'absolute',
          top: selection.top,
          left: selection.left,
          transform: 'translate(-50%, calc(-100% - 8px))',
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'primary.light',
          borderRadius: '9999px',
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          width: 'fit-content',
          height: 'fit-content',
          zIndex: (theme) => theme.zIndex.tooltip + 1,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            onClick={handleAnswer}
            variant="text"
            startIcon={<QuestionAnswerOutlinedIcon />}
            sx={{
              textTransform: 'none',
              color: 'text.primary',
              borderRadius: '9999px',
              '&:hover': {
                bgcolor: 'rgba(156, 163, 175, 0.5)',
              },
            }}
          >
            Answer
          </Button>
          <Button
            onClick={handleCopy}
            variant="text"
            startIcon={<ContentCopyOutlinedIcon />}
            sx={{
              textTransform: 'none',
              color: 'text.primary',
              borderRadius: '9999px',
              '&:hover': {
                bgcolor: 'rgba(156, 163, 175, 0.5)',
              },
            }}
          >
            Copy
          </Button>
          <Button
            onClick={handleTranslate}
            variant="text"
            startIcon={<GTranslateOutlinedIcon />}
            sx={{
              textTransform: 'none',
              color: 'text.primary',
              borderRadius: '9999px',
              '&:hover': {
                bgcolor: 'rgba(156, 163, 175, 0.5)',
              },
            }}
          >
            Translate
          </Button>
        </Stack>
      </Paper>
    </ClickAwayListener>
  );
}
