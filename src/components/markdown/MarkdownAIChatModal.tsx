'use client';

import React, {
  useCallback,
  useEffect,
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
import AIChatModalTabBar from './AIChatModalTabBar';
import AIChatContent from './AIChatContent';
import { fetchMarkdownManual, MarkdownManualError } from '@/services/markdown/fetchMarkdownManual';
import { fetchWritingAssistant, WritingAssistantError } from '@/services/writing/fetchWritingAssistant';
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
  noteId?: string;
}

const modalContainerSx: SxProps<Theme> = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '85%',
  maxWidth: '1400px',
  height: '85%',
  maxHeight: '900px',
  bgcolor: '#1a1a1a',
  borderRadius: 4,
  boxShadow: '0px 30px 90px rgba(0, 0, 0, 0.6), 0px 0px 0px 1px rgba(255, 255, 255, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const INITIAL_QUESTION = 'How do I use Markdown?';

export default function MarkdownAIChatModal({ open, onClose, noteId }: MarkdownAIChatModalProps) {
  const [activeTab, setActiveTab] = useState(0);

  // Writing Assistant tab state (tab 0)
  const [question, setQuestion] = useState('');
  const [responses, setResponses] = useState<ConversationEntry[]>([]);
  const [isResponding, setIsResponding] = useState(false);
  const [hasInitialResponseFetched, setHasInitialResponseFetched] = useState(false);

  // Markdown Assistant tab state (tab 1)
  const [markdownQuestion, setMarkdownQuestion] = useState('');
  const [markdownResponses, setMarkdownResponses] = useState<ConversationEntry[]>([]);
  const [isMarkdownResponding, setIsMarkdownResponding] = useState(false);
  const [hasMarkdownInitialResponseFetched, setHasMarkdownInitialResponseFetched] = useState(false);

  const { currentUser } = useAuth();
  const { avatar: storedAvatar, displayName: storedDisplayName } = useMarkdownStore();
  const userAvatarUrl = storedAvatar || currentUser?.photoURL || undefined;
  const userDisplayName =
    storedDisplayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || undefined;

  const requestIdRef = useRef<number>(0);
  const requestLockRef = useRef<boolean>(false);
  const responseContainerRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(generateUUID());

  // Markdown Assistant tab refs
  const markdownRequestIdRef = useRef<number>(0);
  const markdownRequestLockRef = useRef<boolean>(false);
  const markdownResponseContainerRef = useRef<HTMLDivElement>(null);
  const markdownSessionIdRef = useRef<string>(generateUUID());

  const isGeneratingResponse = responses.some((entry) => entry.isLoading);
  const shouldShowResponse = responses.length > 0;
  const isBusy = isResponding || isGeneratingResponse;

  // Markdown Assistant tab helpers
  const isMarkdownGeneratingResponse = markdownResponses.some((entry) => entry.isLoading);
  const shouldShowMarkdownResponse = markdownResponses.length > 0;
  const isMarkdownBusy = isMarkdownResponding || isMarkdownGeneratingResponse;

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

  const scrollMarkdownResponsesToBottom = useCallback(() => {
    const container = markdownResponseContainerRef.current;
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
    if (shouldShowMarkdownResponse) {
      scrollMarkdownResponsesToBottom();
    }
  }, [markdownResponses, shouldShowMarkdownResponse, scrollMarkdownResponsesToBottom]);

  // Fetch initial response for Writing Assistant when modal opens (tab 0)
  useEffect(() => {
    if (open && activeTab === 0 && !hasInitialResponseFetched) {
      setHasInitialResponseFetched(true);
      void fetchInitialResponse();
    }
  }, [open, activeTab, hasInitialResponseFetched]);

  // Fetch initial response for Markdown Assistant when tab is clicked (tab 1)
  useEffect(() => {
    if (open && activeTab === 1 && !hasMarkdownInitialResponseFetched) {
      setHasMarkdownInitialResponseFetched(true);
      void fetchMarkdownInitialResponse();
    }
  }, [open, activeTab, hasMarkdownInitialResponseFetched]);

  const fetchInitialResponse = async () => {
    if (requestLockRef.current || !noteId) {
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
      const aiResponse = await fetchWritingAssistant(INITIAL_QUESTION, noteId, sessionIdRef.current);

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
      console.error('Writing assistant response error', error);
      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId
            ? {
                ...entry,
                response:
                  error instanceof WritingAssistantError
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

  const fetchMarkdownInitialResponse = async () => {
    if (markdownRequestLockRef.current) {
      return;
    }

    const requestId = markdownRequestIdRef.current + 1;
    markdownRequestIdRef.current = requestId;
    markdownRequestLockRef.current = true;
    setIsMarkdownResponding(true);

    setMarkdownResponses([
      {
        id: requestId,
        prompt: INITIAL_QUESTION,
        response: '',
        isLoading: true,
      },
    ]);

    try {
      const aiResponse = await fetchMarkdownManual(
        INITIAL_QUESTION,
        markdownSessionIdRef.current
      );

      setMarkdownResponses((prev) =>
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
      setIsMarkdownResponding(false);
    } catch (error) {
      console.error('Markdown manual response error', error);
      setMarkdownResponses((prev) =>
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
      setIsMarkdownResponding(false);
    } finally {
      if (markdownRequestIdRef.current === requestId) {
        markdownRequestLockRef.current = false;
      }
    }
  };

  const handleClose = useCallback(() => {
    setResponses([]);
    setQuestion('');
    setHasInitialResponseFetched(false);
    setMarkdownResponses([]);
    setMarkdownQuestion('');
    setHasMarkdownInitialResponseFetched(false);
    setActiveTab(0);
    onClose();
  }, [onClose]);

  const handleSearch = useCallback(async () => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || isBusy || requestLockRef.current || !noteId) {
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
      const aiResponse = await fetchWritingAssistant(trimmedQuestion, noteId, sessionIdRef.current);

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
      console.error('Writing assistant response error', error);
      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId
            ? {
                ...entry,
                response:
                  error instanceof WritingAssistantError
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
  }, [isBusy, question, noteId]);

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

  // Markdown Assistant tab handlers
  const handleMarkdownSearch = useCallback(async () => {
    const trimmedQuestion = markdownQuestion.trim();
    if (!trimmedQuestion || isMarkdownBusy || markdownRequestLockRef.current) {
      return;
    }

    const requestId = markdownRequestIdRef.current + 1;
    markdownRequestIdRef.current = requestId;
    markdownRequestLockRef.current = true;
    setIsMarkdownResponding(true);

    setMarkdownResponses((prev) => [
      ...prev,
      {
        id: requestId,
        prompt: trimmedQuestion,
        response: '',
        isLoading: true,
      },
    ]);
    setMarkdownQuestion('');

    try {
      const aiResponse = await fetchMarkdownManual(trimmedQuestion, markdownSessionIdRef.current);

      setMarkdownResponses((prev) =>
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
      setIsMarkdownResponding(false);
    } catch (error) {
      console.error('Markdown manual response error', error);
      setMarkdownResponses((prev) =>
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
      setIsMarkdownResponding(false);
    } finally {
      if (markdownRequestIdRef.current === requestId) {
        markdownRequestLockRef.current = false;
      }
    }
  }, [isMarkdownBusy, markdownQuestion]);

  const handleMarkdownKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isMarkdownBusy && !markdownRequestLockRef.current) {
        void handleMarkdownSearch();
      }
    }
  };

  const handleMarkdownSearchRequest = () => {
    if (!isMarkdownBusy && !markdownRequestLockRef.current) {
      void handleMarkdownSearch();
    }
  };

  const latestResponseId = responses.length ? responses[responses.length - 1].id : null;
  const latestMarkdownResponseId = markdownResponses.length ? markdownResponses[markdownResponses.length - 1].id : null;

  const handleAnimationFinished = useCallback((responseId: number) => {
    if (requestIdRef.current === responseId) {
      setIsResponding(false);
    }
  }, []);

  const handleMarkdownAnimationFinished = useCallback((responseId: number) => {
    if (markdownRequestIdRef.current === responseId) {
      setIsMarkdownResponding(false);
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
            top: 20,
            right: 20,
            color: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1,
            '&:hover': {
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
          aria-label="Close AI chat"
        >
          <CloseIcon />
        </IconButton>

        <AIChatModalTabBar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            px: { xs: 3, md: 6 },
            py: { xs: 4, md: 5 },
            gap: 3,
          }}
        >
          {activeTab === 0 && (
            <AIChatContent
              responses={responses}
              question={question}
              onQuestionChange={setQuestion}
              onKeyPress={handleKeyPress}
              onSearch={handleSearchRequest}
              isBusy={isBusy}
              userAvatarUrl={userAvatarUrl}
              userDisplayName={userDisplayName}
              responseContainerRef={responseContainerRef}
              onAnimationFinished={handleAnimationFinished}
              latestResponseId={latestResponseId}
            />
          )}

          {activeTab === 1 && (
            <AIChatContent
              responses={markdownResponses}
              question={markdownQuestion}
              onQuestionChange={setMarkdownQuestion}
              onKeyPress={handleMarkdownKeyPress}
              onSearch={handleMarkdownSearchRequest}
              isBusy={isMarkdownBusy}
              userAvatarUrl={userAvatarUrl}
              userDisplayName={userDisplayName}
              responseContainerRef={markdownResponseContainerRef}
              onAnimationFinished={handleMarkdownAnimationFinished}
              latestResponseId={latestMarkdownResponseId}
            />
          )}
        </Box>
      </Box>
    </Modal>
  );
}
