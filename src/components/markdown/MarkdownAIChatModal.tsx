'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import AIChatContent from './AIChatContent';
import WritingAssistantSessionTabs from './WritingAssistantSessionTabs';
import { fetchMarkdownManual, MarkdownManualError } from '@/services/markdown/fetchMarkdownManual';
import { fetchWritingAssistant, WritingAssistantError } from '@/services/writing/fetchWritingAssistant';
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

type WritingSessionRecord = {
  id: string;
  label: string;
  responses: ConversationEntry[];
};

interface MarkdownAIChatModalProps {
  open: boolean;
  onClose: () => void;
  noteId?: string;
}

const modalContainerStyle: CSSProperties = {
  width: 'min(85vw, 1400px)',
  height: '85vh',
  backgroundColor: grayColor1,
  borderRadius: '24px',
  boxShadow: '0px 25px 60px rgba(0, 0, 0, 0.45)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  position: 'relative',
};

const overlayStyle: CSSProperties = {
  backgroundColor: 'rgba(3, 7, 18, 0.78)',
  backdropFilter: 'blur(2px)',
};

const TAB_ITEMS = [
  { id: 'writing-assistant', label: 'Writing Assistant', Icon: ChatBubbleIcon },
  { id: 'markdown-assistant', label: 'Markdown Assistant', Icon: BookIcon },
] as const;

const MARKDOWN_INITIAL_QUESTION = 'How do I use Markdown?';

export default function MarkdownAIChatModal({ open, onClose, noteId }: MarkdownAIChatModalProps) {
  const [activeTab, setActiveTab] = useState(0);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Writing Assistant state
  const [writingQuestion, setWritingQuestion] = useState('');
  const [writingResponses, setWritingResponses] = useState<ConversationEntry[]>([]);
  const [isWritingResponding, setIsWritingResponding] = useState(false);
  const writingRequestIdRef = useRef(0);
  const writingRequestLockRef = useRef(false);
  const writingResponseContainerRef = useRef<HTMLDivElement>(null);
  const writingSessionIdRef = useRef(generateUUID());
  const [writingSessions, setWritingSessions] = useState<WritingSessionRecord[]>([]);
  const [activeWritingSessionId, setActiveWritingSessionId] = useState<string | null>(null);
  const [isActiveWritingSessionSaved, setIsActiveWritingSessionSaved] = useState(false);

  // Markdown Assistant state
  const [markdownQuestion, setMarkdownQuestion] = useState('');
  const [markdownResponses, setMarkdownResponses] = useState<ConversationEntry[]>([]);
  const [isMarkdownResponding, setIsMarkdownResponding] = useState(false);
  const [hasMarkdownInitialResponseFetched, setHasMarkdownInitialResponseFetched] = useState(false);
  const markdownRequestIdRef = useRef(0);
  const markdownRequestLockRef = useRef(false);
  const markdownResponseContainerRef = useRef<HTMLDivElement>(null);
  const markdownSessionIdRef = useRef(generateUUID());

  const { currentUser } = useAuth();
  const { avatar: storedAvatar, displayName: storedDisplayName } = useMarkdownStore();
  const userAvatarUrl = storedAvatar || currentUser?.photoURL || undefined;
  const userDisplayName =
    storedDisplayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || undefined;

  const isWritingGeneratingResponse = writingResponses.some((entry) => entry.isLoading);
  const isWritingBusy = isWritingResponding || isWritingGeneratingResponse;

  const isMarkdownGeneratingResponse = markdownResponses.some((entry) => entry.isLoading);
  const isMarkdownBusy = isMarkdownResponding || isMarkdownGeneratingResponse;

  const persistWritingSessionResponses = useCallback(
    (sessionId: string, responses: ConversationEntry[], createIfMissing = false) => {
      setWritingSessions((prevSessions) => {
        const existingIndex = prevSessions.findIndex((session) => session.id === sessionId);

        if (existingIndex === -1) {
          if (!createIfMissing) {
            return prevSessions;
          }

          const newSession: WritingSessionRecord = {
            id: sessionId,
            label: `Session ${prevSessions.length + 1}`,
            responses,
          };

          return [...prevSessions, newSession];
        }

        const nextSessions = [...prevSessions];
        nextSessions[existingIndex] = {
          ...prevSessions[existingIndex],
          responses,
        };
        return nextSessions;
      });
    },
    []
  );

  const initializeWritingSession = useCallback(() => {
    const newSessionId = generateUUID();
    writingSessionIdRef.current = newSessionId;
    writingRequestIdRef.current = 0;
    writingRequestLockRef.current = false;
    setActiveWritingSessionId(newSessionId);
    setIsActiveWritingSessionSaved(false);
    setWritingQuestion('');
    setWritingResponses([]);
    setIsWritingResponding(false);
  }, []);

  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => {
      modalContentRef.current?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    initializeWritingSession();
  }, [open, initializeWritingSession]);

  useEffect(() => {
    if (typeof document === 'undefined' || !open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Auto-scroll for writing assistant
  useEffect(() => {
    const container = writingResponseContainerRef.current;
    if (container && writingResponses.length > 0) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [writingResponses]);

  // Auto-scroll for markdown assistant
  useEffect(() => {
    const container = markdownResponseContainerRef.current;
    if (container && markdownResponses.length > 0) {
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  }, [markdownResponses]);

  // Fetch initial markdown response when tab is activated
  useEffect(() => {
    if (open && activeTab === 1 && !hasMarkdownInitialResponseFetched) {
      setHasMarkdownInitialResponseFetched(true);
      void fetchMarkdownInitialResponse();
    }
  }, [open, activeTab, hasMarkdownInitialResponseFetched]);

  const fetchMarkdownInitialResponse = async () => {
    if (markdownRequestLockRef.current) return;

    const requestId = markdownRequestIdRef.current + 1;
    markdownRequestIdRef.current = requestId;
    markdownRequestLockRef.current = true;
    setIsMarkdownResponding(true);

    setMarkdownResponses([
      {
        id: requestId,
        prompt: MARKDOWN_INITIAL_QUESTION,
        response: '',
        isLoading: true,
      },
    ]);

    try {
      const aiResponse = await fetchMarkdownManual(MARKDOWN_INITIAL_QUESTION, markdownSessionIdRef.current);

      setMarkdownResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId ? { ...entry, response: aiResponse, isLoading: false } : entry
        )
      );
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
    } finally {
      setIsMarkdownResponding(false);
      markdownRequestLockRef.current = false;
    }
  };

  const handleClose = useCallback(() => {
    setWritingResponses([]);
    setWritingQuestion('');
    setIsWritingResponding(false);
    setIsActiveWritingSessionSaved(false);
    setActiveWritingSessionId(null);
    setMarkdownResponses([]);
    setMarkdownQuestion('');
    setHasMarkdownInitialResponseFetched(false);
    setActiveTab(0);
    writingRequestIdRef.current = 0;
    writingRequestLockRef.current = false;
    onClose();
  }, [onClose]);

  // Writing Assistant handlers
  const handleWritingSearch = useCallback(async () => {
    const trimmedQuestion = writingQuestion.trim();
    if (!trimmedQuestion || isWritingBusy || writingRequestLockRef.current) return;

    const sessionId = writingSessionIdRef.current;
    const sessionAlreadySaved = writingSessions.some((session) => session.id === sessionId);

    if (!noteId) {
      const requestId = writingRequestIdRef.current + 1;
      writingRequestIdRef.current = requestId;

      setWritingResponses((prev) => [
        ...prev,
        {
          id: requestId,
          prompt: trimmedQuestion,
          response: 'Please save your note first before using the Writing Assistant.',
          isLoading: false,
        },
      ]);
      setWritingQuestion('');
      return;
    }

    const requestId = writingRequestIdRef.current + 1;
    writingRequestIdRef.current = requestId;
    writingRequestLockRef.current = true;
    setIsWritingResponding(true);

    let sessionResponsesSnapshot: ConversationEntry[] = [];
    setWritingResponses((prev) => {
      sessionResponsesSnapshot = [
        ...prev,
        {
          id: requestId,
          prompt: trimmedQuestion,
          response: '',
          isLoading: true,
        },
      ];
      return sessionResponsesSnapshot;
    });
    setWritingQuestion('');

    if (sessionAlreadySaved) {
      persistWritingSessionResponses(sessionId, sessionResponsesSnapshot);
    }

    try {
      const aiResponse = await fetchWritingAssistant(trimmedQuestion, noteId, sessionId);

      const fulfilledResponses = sessionResponsesSnapshot.map((entry) =>
        entry.id === requestId ? { ...entry, response: aiResponse, isLoading: false } : entry
      );

      sessionResponsesSnapshot = fulfilledResponses;

      if (writingSessionIdRef.current === sessionId) {
        setWritingResponses(fulfilledResponses);
      }

      persistWritingSessionResponses(sessionId, fulfilledResponses, true);

      if (activeWritingSessionId === sessionId) {
        setIsActiveWritingSessionSaved(true);
        setActiveWritingSessionId(sessionId);
      }
    } catch (error) {
      console.error('Writing assistant response error', error);

      const errorMessage =
        error instanceof WritingAssistantError
          ? error.message
          : 'Unable to generate a response right now. Please try again.';

      const errorResponses = sessionResponsesSnapshot.map((entry) =>
        entry.id === requestId
          ? {
              ...entry,
              response: errorMessage,
              isLoading: false,
            }
          : entry
      );

      sessionResponsesSnapshot = errorResponses;

      if (writingSessionIdRef.current === sessionId) {
        setWritingResponses(errorResponses);
      }

      persistWritingSessionResponses(sessionId, errorResponses, true);

      if (activeWritingSessionId === sessionId) {
        setIsActiveWritingSessionSaved(true);
        setActiveWritingSessionId(sessionId);
      }
    } finally {
      setIsWritingResponding(false);
      writingRequestLockRef.current = false;
    }
  }, [activeWritingSessionId, isWritingBusy, noteId, persistWritingSessionResponses, writingQuestion, writingSessions]);

  const handleSelectWritingSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeWritingSessionId) return;

      const session = writingSessions.find((entry) => entry.id === sessionId);
      if (!session) return;

      writingSessionIdRef.current = sessionId;
      writingRequestIdRef.current = session.responses.reduce((max, entry) => Math.max(max, entry.id), 0);
      writingRequestLockRef.current = false;

      setActiveWritingSessionId(sessionId);
      setIsActiveWritingSessionSaved(true);
      setWritingResponses(session.responses);
      setWritingQuestion('');
      setIsWritingResponding(false);
    },
    [activeWritingSessionId, writingSessions]
  );

  const handleWritingKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isWritingBusy && !writingRequestLockRef.current) {
        void handleWritingSearch();
      }
    }
  };

  const handleWritingSearchRequest = () => {
    if (!isWritingBusy && !writingRequestLockRef.current) {
      void handleWritingSearch();
    }
  };

  // Markdown Assistant handlers
  const handleMarkdownSearch = useCallback(async () => {
    const trimmedQuestion = markdownQuestion.trim();
    if (!trimmedQuestion || isMarkdownBusy || markdownRequestLockRef.current) return;

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
          entry.id === requestId ? { ...entry, response: aiResponse, isLoading: false } : entry
        )
      );
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
    } finally {
      setIsMarkdownResponding(false);
      markdownRequestLockRef.current = false;
    }
  }, [isMarkdownBusy, markdownQuestion]);

  const handleMarkdownKeyDown = (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleModalKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.repeat) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        handleClose();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && (event.code === 'Backslash' || event.key === '\\')) {
        event.preventDefault();
        handleClose();
      }
    },
    [handleClose]
  );

  const latestWritingResponseId =
    writingResponses.length > 0 ? writingResponses[writingResponses.length - 1].id : null;

  const latestMarkdownResponseId =
    markdownResponses.length > 0 ? markdownResponses[markdownResponses.length - 1].id : null;

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[1400] flex items-center justify-center px-4 py-8 sm:px-6"
      role="dialog"
      aria-modal="true"
      aria-label="AI chat modal"
    >
      <div
        style={overlayStyle}
        className="absolute inset-0"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        ref={modalContentRef}
        style={modalContainerStyle}
        className="relative flex max-h-full w-full focus:outline-none"
        tabIndex={-1}
        onKeyDown={handleModalKeyDown}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="group absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label="Close AI chat"
        >
          <CloseIconSvg className="h-5 w-5" />
        </button>

        <div className="border-b border-white/10">
          <div className="flex flex-wrap px-6" role="tablist" aria-label="AI chat assistants">
            {TAB_ITEMS.map((tab, index) => {
              const isActive = activeTab === index;
              const tabId = `${tab.id}-tab`;
              const panelId = `${tab.id}-panel`;

              return (
                <button
                  key={tab.id}
                  type="button"
                  id={tabId}
                  role="tab"
                  aria-controls={panelId}
                  aria-selected={isActive}
                  className={`relative flex min-h-[60px] items-center gap-2 rounded-t px-6 text-[0.95rem] font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 ${
                    isActive ? 'text-white' : 'text-white/60 hover:bg-white/5 hover:text-white/90'
                  }`}
                  onClick={() => setActiveTab(index)}
                >
                  <tab.Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-full rounded-t"
                      style={{
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {activeTab === 0 && (
            <section
              role="tabpanel"
              id="writing-assistant-panel"
              aria-labelledby="writing-assistant-tab"
              className="flex flex-1 flex-col"
            >
              <div className="flex h-full">
                <WritingAssistantSessionTabs
                  sessions={writingSessions}
                  activeSessionId={isActiveWritingSessionSaved ? activeWritingSessionId : null}
                  onSelect={handleSelectWritingSession}
                />
                <div className="flex flex-1 flex-col px-6 py-6">
                  <AIChatContent
                    responses={writingResponses}
                    question={writingQuestion}
                    onQuestionChange={setWritingQuestion}
                    onKeyDown={handleWritingKeyDown}
                    onSearch={handleWritingSearchRequest}
                    isBusy={isWritingBusy}
                    userAvatarUrl={userAvatarUrl}
                    userDisplayName={userDisplayName}
                    responseContainerRef={writingResponseContainerRef}
                    latestResponseId={latestWritingResponseId}
                  />
                </div>
              </div>
            </section>
          )}

          {activeTab === 1 && (
            <section
              role="tabpanel"
              id="markdown-assistant-panel"
              aria-labelledby="markdown-assistant-tab"
              className="flex flex-1 flex-col"
            >
              <AIChatContent
                responses={markdownResponses}
                question={markdownQuestion}
                onQuestionChange={setMarkdownQuestion}
                onKeyDown={handleMarkdownKeyDown}
                onSearch={handleMarkdownSearchRequest}
                isBusy={isMarkdownBusy}
                userAvatarUrl={userAvatarUrl}
                userDisplayName={userDisplayName}
                responseContainerRef={markdownResponseContainerRef}
                latestResponseId={latestMarkdownResponseId}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

interface IconProps {
  className?: string;
}

function CloseIconSvg({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 6l12 12" />
      <path d="M6 18L18 6" />
    </svg>
  );
}

function ChatBubbleIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 4h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function BookIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 4h7a3 3 0 0 1 3 3v11l-6-2-6 2V7a3 3 0 0 1 3-3z" />
      <path d="M16 4h1a3 3 0 0 1 3 3v11" />
    </svg>
  );
}
