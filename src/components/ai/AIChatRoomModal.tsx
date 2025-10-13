'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  IconButton,
  Modal,
  type SxProps,
  type Theme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AIHeader from './AIHeader';
import AIQuestionInput from './AIQuestionInput';
import AIModelSelector from './AIModelSelector';
import AIResponseDisplay from './AIResponseDisplay';
import { aiModels, type AIModel } from './types';
import { fetchFastAIResponse, FastAIRequestError } from '@/services/ai/fetchFastAIResponse';
import { grayColor1 } from '@/constants/color';
import { generateUUID } from '@/utils/generateUUID';
import { useAuth } from '@/contexts/AuthContext';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

type ConversationEntry = {
  id: number;
  prompt: string;
  response: string;
  isLoading: boolean;
};

interface AIChatRoomModalProps {
  open: boolean;
  onClose: () => void;
}

const modalContainerSx: SxProps<Theme> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '80%',
  height: '80%',
  bgcolor: grayColor1,
  borderRadius: 3,
  boxShadow: '0px 25px 60px rgba(0, 0, 0, 0.45)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

export default function AIChatRoomModal({ open, onClose }: AIChatRoomModalProps) {
  const [question, setQuestion] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [responses, setResponses] = useState<ConversationEntry[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);

  const { currentUser } = useAuth();
  const { avatar: storedAvatar, displayName: storedDisplayName } = useMarkdownStore();
  const userAvatarUrl = storedAvatar || currentUser?.photoURL || undefined;
  const userDisplayName =
    storedDisplayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || undefined;

  const requestIdRef = useRef<number>(0);
  const requestLockRef = useRef<boolean>(false);
  const responseContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(generateUUID());
  const responsesRef = useRef<ConversationEntry[]>([]);

  const isMenuOpen = Boolean(anchorEl);
  const isGeneratingResponse = responses.some((entry) => entry.isLoading);
  const shouldShowResponse = responses.length > 0;
  const isBusy = isResponding || isGeneratingResponse;

  const scrollResponsesToBottom = useCallback(() => {
    const container = responseContainerRef.current;
    if (!container) {
      return;
    }

    const scroll = () => {
      container.scrollTop = container.scrollHeight;
    };

    requestAnimationFrame(() => {
      scroll();
      requestAnimationFrame(scroll);
    });
  }, []);

  useEffect(() => {
    if (shouldShowResponse) {
      scrollResponsesToBottom();
    }
  }, [responses, shouldShowResponse, scrollResponsesToBottom]);

  useEffect(() => {
    responsesRef.current = responses;
  }, [responses]);

  useEffect(() => {
    if (question.trim()) {
      return;
    }

    setEditingEntryId(null);
  }, [question]);

  useEffect(() => {
    if (!open) {
      setAnchorEl(null);
    }
  }, [open]);

  const focusQuestionInput = useCallback(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const input = document.getElementById('ai-question-input') as HTMLTextAreaElement | null;
    if (!input) {
      return;
    }

    requestAnimationFrame(() => {
      input.focus();
      const length = input.value.length;
      input.setSelectionRange(length, length);
    });
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
    onClose();
  }, [onClose]);

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

  const handleSearch = useCallback(async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isBusy || requestLockRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    requestLockRef.current = true;
    setIsResponding(true);
    setEditingEntryId(null);

    setResponses((prev) => [
      ...prev,
      {
        id: requestId,
        prompt: trimmedQuestion,
        response: '',
        isLoading: true,
      },
    ]);
    setQuestion('');

    try {
      const { response: aiResponse } = await fetchFastAIResponse({
        prompt: trimmedQuestion,
        sessionId: sessionIdRef.current,
      });

      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId
            ? {
                ...entry,
                response: aiResponse,
                isLoading: false,
              }
            : entry
        )
      );
      setIsResponding(false);
    } catch (error) {
      console.error('FAST API response error', error);
      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId
            ? {
                ...entry,
                response:
                  error instanceof FastAIRequestError
                    ? error.message
                    : 'Unable to generate a response right now. Please try again.',
                isLoading: false,
              }
            : entry
        )
      );
      setIsResponding(false);
    } finally {
      if (requestIdRef.current === requestId) {
        requestLockRef.current = false;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mock-ai:response-complete'));
        }
      }
    }
  }, [isBusy, question]);

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isBusy && !requestLockRef.current) {
        void handleSearch();
      }
    }
  };

  const handleSearchRequest = () => {
    if (!isBusy && !requestLockRef.current) {
      void handleSearch();
    }
  };

  const handleEditPrompt = useCallback(
    (entryId: number) => {
      if (isBusy) {
        return;
      }

      const targetEntry = responsesRef.current.find((entry) => entry.id === entryId);
      if (!targetEntry) {
        return;
      }

      setQuestion(targetEntry.prompt);
      setEditingEntryId(entryId);
      focusQuestionInput();
    },
    [focusQuestionInput, isBusy]
  );

  const handleRegenerateResponse = useCallback(
    async (entryId: number) => {
      if (isBusy || requestLockRef.current) {
        return;
      }

      const targetEntry = responsesRef.current.find((entry) => entry.id === entryId);
      if (!targetEntry || !targetEntry.prompt.trim() || targetEntry.isLoading) {
        return;
      }

      requestLockRef.current = true;
      setIsResponding(true);
      setEditingEntryId(null);

      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                isLoading: true,
              }
            : entry
        )
      );

      try {
        const { response: regeneratedResponse } = await fetchFastAIResponse({
          prompt: targetEntry.prompt,
          sessionId: sessionIdRef.current,
        });

        setResponses((prev) =>
          prev.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  response: regeneratedResponse,
                  isLoading: false,
                }
              : entry
          )
        );
      } catch (error) {
        console.error('FAST API regeneration error', error);
        setResponses((prev) =>
          prev.map((entry) =>
            entry.id === entryId
              ? {
                  ...entry,
                  response:
                    error instanceof FastAIRequestError
                      ? error.message
                      : 'Unable to regenerate a response right now. Please try again.',
                  isLoading: false,
                }
              : entry
          )
        );
      } finally {
        setIsResponding(false);
        requestLockRef.current = false;
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mock-ai:response-complete'));
        }
      }
    },
    [isBusy]
  );

  const stackedResponseStyle = useMemo<React.CSSProperties>(() => ({ marginTop: 0 }), []);
  const latestResponseId = responses.length ? responses[responses.length - 1].id : null;

  const handleAnimationFinished = useCallback((responseId: number) => {
    if (requestIdRef.current === responseId) {
      setIsResponding(false);
    }
  }, []);

  const handleModalKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.repeat) {
        return;
      }
      if ((event.metaKey || event.ctrlKey) && (event.code === 'Backslash' || event.key === '\\')) {
        event.preventDefault();
        handleClose();
      }
    },
    [handleClose]
  );

  return (
    <Modal open={open} onClose={handleClose} keepMounted>
      <Box sx={modalContainerSx} onKeyDown={handleModalKeyDown} tabIndex={-1}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              color: 'white',
            },
          }}
          aria-label="Close AI chat"
        >
          <CloseIcon />
        </IconButton>
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 6 },
            gap: 3,
          }}
        >
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
                    isLatestResponse={latestResponseId === entry.id}
                    style={stackedResponseStyle}
                    userAvatarUrl={userAvatarUrl}
                    userDisplayName={userDisplayName}
                    onEditPrompt={() => handleEditPrompt(entry.id)}
                    onRegenerateResponse={() => handleRegenerateResponse(entry.id)}
                    isEditingPrompt={editingEntryId === entry.id}
                    disableActions={isBusy}
                    onAnimationFinished={
                      !entry.isLoading && latestResponseId === entry.id
                        ? () => handleAnimationFinished(entry.id)
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
            <AIQuestionInput
              question={question}
              selectedModel={selectedModel}
              onChange={setQuestion}
              onKeyPress={handleKeyPress}
              onModelSelectorClick={handleModelSelectorClick}
              onSearch={handleSearchRequest}
              isBusy={isBusy}
            />
          </Box>
        </Box>

        <AIModelSelector
          anchorEl={anchorEl}
          isOpen={isMenuOpen}
          models={aiModels}
          selectedModel={selectedModel}
          onClose={handleMenuClose}
          onModelSelect={handleModelSelect}
        />
      </Box>
    </Modal>
  );
}
