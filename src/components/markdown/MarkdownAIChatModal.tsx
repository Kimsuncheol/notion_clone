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
import AIHeader from '../ai/AIHeader';
import AIQuestionInputForMarkdownAIChatModal from './AIQuestionInputForMarkdownAIChatModal';
import AIResponseDisplay from '../ai/AIResponseDisplay';
import { fetchMarkdownManual, MarkdownManualError } from '@/services/markdown/fetchMarkdownManual';
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

interface MarkdownAIChatModalProps {
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

const INITIAL_QUESTION = 'How do I use Markdown?';

export default function MarkdownAIChatModal({ open, onClose }: MarkdownAIChatModalProps) {
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState<ConversationEntry[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [hasInitialResponseFetched, setHasInitialResponseFetched] = useState(false);

  const { currentUser } = useAuth();
  const { avatar: storedAvatar, displayName: storedDisplayName } = useMarkdownStore();
  const userAvatarUrl = storedAvatar || currentUser?.photoURL || undefined;
  const userDisplayName =
    storedDisplayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || undefined;

  const requestIdRef = useRef<number>(0);
  const requestLockRef = useRef<boolean>(false);
  const responseContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(generateUUID());

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


  // Fetch initial response when modal opens
  useEffect(() => {
    if (open && !hasInitialResponseFetched) {
      setHasInitialResponseFetched(true);
      void fetchInitialResponse();
    }
  }, [open]);

  const fetchInitialResponse = async () => {
    if (requestLockRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    requestLockRef.current = true;
    setIsResponding(true);

    setResponses([
      {
        id: requestId,
        prompt: INITIAL_QUESTION,
        response: '',
        isLoading: true,
      },
    ]);

    try {
      const aiResponse = await fetchMarkdownManual(INITIAL_QUESTION, sessionIdRef.current);

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
      console.error('Markdown manual response error', error);
      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId
            ? {
                ...entry,
                response:
                  error instanceof MarkdownManualError
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
      }
    }
  };

  const handleClose = useCallback(() => {
    setResponses([]);
    setQuestion('');
    setHasInitialResponseFetched(false);
    onClose();
  }, [onClose]);

  const handleSearch = useCallback(async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isBusy || requestLockRef.current) {
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    requestLockRef.current = true;
    setIsResponding(true);

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
      const aiResponse = await fetchMarkdownManual(trimmedQuestion, sessionIdRef.current);

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
      console.error('Markdown manual response error', error);
      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId
            ? {
                ...entry,
                response:
                  error instanceof MarkdownManualError
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
                    style={stackedResponseStyle}
                    userAvatarUrl={userAvatarUrl}
                    userDisplayName={userDisplayName}
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
            <AIQuestionInputForMarkdownAIChatModal
              question={question}
              onChange={setQuestion}
              onKeyPress={handleKeyPress}
              onSearch={handleSearchRequest}
              isBusy={isBusy}
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
