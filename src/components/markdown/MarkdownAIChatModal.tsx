'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import AIChatContent from './AIChatContent';
import WritingAssistantSessionTabs from './WritingAssistantSessionTabs';
import { fetchMarkdownManual, MarkdownManualError } from '@/services/markdown/fetchMarkdownManual';
import { fetchWritingAssistant, WritingAssistantError } from '@/services/writing/fetchWritingAssistant';
import {
  deleteNoteWritingAssistantSession,
  fetchNoteWritingAssistantSessions,
  saveNoteWritingAssistantSession,
} from '@/services/markdown/firebase';
import type { NoteWritingAssistantSession } from '@/types/writingAssistant';
import { grayColor1 } from '@/constants/color';
import { generateUUID } from '@/utils/generateUUID';
import { useAuth } from '@/contexts/AuthContext';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import toast from 'react-hot-toast';

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
  firstResponseSummary?: string;
  createdAt: string;
  updatedAt: string;
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
  const writingSessionCreatedAtRef = useRef<string>(new Date().toISOString());
  const [writingSessions, setWritingSessions] = useState<WritingSessionRecord[]>([]);
  const writingSessionsRef = useRef<WritingSessionRecord[]>([]);
  const [activeWritingSessionId, setActiveWritingSessionId] = useState<string | null>(null);
  const [isActiveWritingSessionSaved, setIsActiveWritingSessionSaved] = useState(false);
  const [editingWritingEntryId, setEditingWritingEntryId] = useState<number | null>(null);
  const [latestWritingActionId, setLatestWritingActionId] = useState<number | null>(null);

  // Markdown Assistant state
  const [markdownQuestion, setMarkdownQuestion] = useState('');
  const [markdownResponses, setMarkdownResponses] = useState<ConversationEntry[]>([]);
  const [isMarkdownResponding, setIsMarkdownResponding] = useState(false);
  const [hasMarkdownInitialResponseFetched, setHasMarkdownInitialResponseFetched] = useState(false);
  const markdownRequestIdRef = useRef(0);
  const markdownRequestLockRef = useRef(false);
  const markdownResponseContainerRef = useRef<HTMLDivElement>(null);
  const markdownSessionIdRef = useRef(generateUUID());
  const [editingMarkdownEntryId, setEditingMarkdownEntryId] = useState<number | null>(null);
  const [latestMarkdownActionId, setLatestMarkdownActionId] = useState<number | null>(null);

  const { currentUser } = useAuth();
  const { avatar: storedAvatar, displayName: storedDisplayName, content: noteContent } = useMarkdownStore();
  const userAvatarUrl = storedAvatar || currentUser?.photoURL || undefined;
  const userDisplayName =
    storedDisplayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || undefined;

  const isWritingGeneratingResponse = writingResponses.some((entry) => entry.isLoading);
  const isWritingBusy = isWritingResponding || isWritingGeneratingResponse;

  const isMarkdownGeneratingResponse = markdownResponses.some((entry) => entry.isLoading);
  const isMarkdownBusy = isMarkdownResponding || isMarkdownGeneratingResponse;

  useEffect(() => {
    writingSessionsRef.current = writingSessions;
  }, [writingSessions]);

  const persistWritingSessionResponses = useCallback(
    async (
      sessionId: string,
      responses: ConversationEntry[],
      options: { summary?: string; createdAt?: string } = {}
    ) => {
      const normalizedSummary = options.summary?.trim();
      const nowIso = new Date().toISOString();
      const sessionsSnapshot = writingSessionsRef.current;
      const existingIndex = sessionsSnapshot.findIndex((session) => session.id === sessionId);

      let draftSessions: WritingSessionRecord[];

      if (existingIndex === -1) {
        const createdAt = options.createdAt ?? nowIso;
        const newSession: WritingSessionRecord = {
          id: sessionId,
          label: '',
          responses,
          firstResponseSummary: normalizedSummary,
          createdAt,
          updatedAt: nowIso,
        };

        draftSessions = [...sessionsSnapshot, newSession];
      } else {
        const existing = sessionsSnapshot[existingIndex];
        const updatedSession: WritingSessionRecord = {
          ...existing,
          responses,
          firstResponseSummary: normalizedSummary ?? existing.firstResponseSummary,
          updatedAt: nowIso,
        };

        draftSessions = [...sessionsSnapshot];
        draftSessions[existingIndex] = updatedSession;
      }

      const sortedSessions = draftSessions
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .map((session, index) => ({
          ...session,
          label: `Session ${index + 1}`,
        }));

      writingSessionsRef.current = sortedSessions;
      setWritingSessions(sortedSessions);

      const record = sortedSessions.find((session) => session.id === sessionId);
      if (!record) {
        return null;
      }

      if (noteId) {
        const payload: NoteWritingAssistantSession = {
          sessionId: record.id,
          firstResponseSummary: record.firstResponseSummary,
          messages: responses.map((entry) => ({
            id: entry.id,
            prompt: entry.prompt,
            response: entry.response,
          })),
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        };

        try {
          await saveNoteWritingAssistantSession(noteId, payload);
        } catch (error) {
          console.error('Failed to persist writing assistant session', error);
        }
      }

      return record;
    },
    [noteId]
  );

  const initializeWritingSession = useCallback(() => {
    const newSessionId = generateUUID();
    const createdAtIso = new Date().toISOString();
    writingSessionIdRef.current = newSessionId;
    writingSessionCreatedAtRef.current = createdAtIso;
    writingRequestIdRef.current = 0;
    writingRequestLockRef.current = false;
    setActiveWritingSessionId(newSessionId);
    setIsActiveWritingSessionSaved(false);
    setWritingQuestion('');
    setWritingResponses([]);
    setIsWritingResponding(false);
    setEditingWritingEntryId(null);
    setLatestWritingActionId(null);
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
    if (!open || !noteId) {
      return;
    }

    let isMounted = true;

    const loadSessions = async () => {
      try {
        const sessionsMap = await fetchNoteWritingAssistantSessions(noteId);
        if (!isMounted) {
          return;
        }

        const sessionsArray = Object.values(sessionsMap)
          .map((session) => ({
            id: session.sessionId,
            label: '',
            responses: session.messages
              .map<ConversationEntry>((message) => ({
                id: message.id,
                prompt: message.prompt,
                response: message.response,
                isLoading: false,
              }))
              .sort((a, b) => a.id - b.id),
            firstResponseSummary: session.firstResponseSummary,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
          }))
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .map((session, index) => ({
            ...session,
            label: `Session ${index + 1}`,
          }));

        setWritingSessions(sessionsArray);
      } catch (error) {
        console.error('Failed to load writing assistant sessions', error);
      }
    };

    void loadSessions();

    return () => {
      isMounted = false;
    };
  }, [noteId, open]);

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
    setLatestMarkdownActionId(requestId);

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
    setEditingWritingEntryId(null);
    setLatestWritingActionId(null);
    setMarkdownResponses([]);
    setMarkdownQuestion('');
    setHasMarkdownInitialResponseFetched(false);
    setEditingMarkdownEntryId(null);
    setLatestMarkdownActionId(null);
    setActiveTab(0);
    writingRequestIdRef.current = 0;
    writingRequestLockRef.current = false;
    writingSessionCreatedAtRef.current = new Date().toISOString();
    onClose();
  }, [onClose]);

  // Writing Assistant handlers
  const runWritingAssistantRequest = useCallback(
    async (entryId: number, promptText: string, mode: 'append' | 'replace') => {
      const normalizedPrompt = promptText.trim();
      setLatestWritingActionId(entryId);
      setIsActiveWritingSessionSaved(false);

      if (!normalizedPrompt) {
        setWritingQuestion('');
        if (mode === 'replace') {
          setEditingWritingEntryId(null);
        }
        return;
      }

      const fallbackResponse = 'Please save your note first before using the Writing Assistant.';

      if (!noteId) {
        setWritingResponses((prev) => {
          if (mode === 'replace') {
            let found = false;
            const updated = prev.map((entry) => {
              if (entry.id !== entryId) {
                return entry;
              }

              found = true;
              return {
                ...entry,
                prompt: normalizedPrompt,
                response: fallbackResponse,
                isLoading: false,
              };
            });

            if (found) {
              return updated;
            }

            return [
              ...prev,
              {
                id: entryId,
                prompt: normalizedPrompt,
                response: fallbackResponse,
                isLoading: false,
              },
            ];
          }

          return [
            ...prev,
            {
              id: entryId,
              prompt: normalizedPrompt,
              response: fallbackResponse,
              isLoading: false,
            },
          ];
        });

        setWritingQuestion('');
        if (mode === 'replace') {
          setEditingWritingEntryId(null);
        }
        return;
      }

      const sessionId = writingSessionIdRef.current;
      writingRequestLockRef.current = true;
      setIsWritingResponding(true);

      let sessionResponsesSnapshot: ConversationEntry[] = [];

      setWritingResponses((prev) => {
        let updated: ConversationEntry[];

        if (mode === 'replace') {
          let found = false;
          updated = prev.map((entry) => {
            if (entry.id !== entryId) {
              return entry;
            }

            found = true;
            return {
              ...entry,
              prompt: normalizedPrompt,
              response: '',
              isLoading: true,
            };
          });

          if (!found) {
            updated = [
              ...prev,
              {
                id: entryId,
                prompt: normalizedPrompt,
                response: '',
                isLoading: true,
              },
            ];
          }
        } else {
          updated = [
            ...prev,
            {
              id: entryId,
              prompt: normalizedPrompt,
              response: '',
              isLoading: true,
            },
          ];
        }

        sessionResponsesSnapshot = updated;
        return updated;
      });

      setWritingQuestion('');
      if (mode === 'replace') {
        setEditingWritingEntryId(null);
      }

      try {
        const { answer, firstResponseSummary } = await fetchWritingAssistant(
          normalizedPrompt,
          noteId,
          noteContent,
          sessionId
        );

        const fulfilledResponses = sessionResponsesSnapshot.map((entry) =>
          entry.id === entryId ? { ...entry, response: answer, isLoading: false } : entry
        );

        setWritingResponses(fulfilledResponses);

        const savedRecord = await persistWritingSessionResponses(sessionId, fulfilledResponses, {
          summary: firstResponseSummary,
          createdAt: writingSessionCreatedAtRef.current,
        });

        if (savedRecord) {
          writingSessionCreatedAtRef.current = savedRecord.createdAt;
          setIsActiveWritingSessionSaved(true);
          setActiveWritingSessionId(savedRecord.id);
        }
      } catch (error) {
        console.error('Writing assistant response error', error);

        const errorMessage =
          error instanceof WritingAssistantError
            ? error.message
            : 'Unable to generate a response right now. Please try again.';

        const errorResponses = sessionResponsesSnapshot.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                response: errorMessage,
                isLoading: false,
              }
            : entry
        );

        setWritingResponses(errorResponses);

        const savedRecord = await persistWritingSessionResponses(sessionId, errorResponses, {
          createdAt: writingSessionCreatedAtRef.current,
        });

        if (savedRecord) {
          writingSessionCreatedAtRef.current = savedRecord.createdAt;
          setIsActiveWritingSessionSaved(true);
          setActiveWritingSessionId(savedRecord.id);
        }
      } finally {
        setIsWritingResponding(false);
        writingRequestLockRef.current = false;
      }
    },
    [noteContent, noteId, persistWritingSessionResponses]
  );

  const handleWritingSearch = useCallback(async () => {
    const trimmedQuestion = writingQuestion.trim();
    if (!trimmedQuestion || writingRequestLockRef.current) return;

    if (editingWritingEntryId !== null) {
      writingRequestIdRef.current = Math.max(writingRequestIdRef.current, editingWritingEntryId);
      await runWritingAssistantRequest(editingWritingEntryId, trimmedQuestion, 'replace');
      return;
    }

    if (isWritingBusy) return;

    const requestId = writingRequestIdRef.current + 1;
    writingRequestIdRef.current = requestId;

    await runWritingAssistantRequest(requestId, trimmedQuestion, 'append');
  }, [editingWritingEntryId, isWritingBusy, runWritingAssistantRequest, writingQuestion]);

  const handleStartEditingWritingPrompt = useCallback(
    (entryId: number) => {
      if (writingRequestLockRef.current || isWritingBusy) {
        return;
      }

      const target = writingResponses.find((entry) => entry.id === entryId);
      if (!target || target.isLoading) {
        return;
      }

      setActiveTab(0);
      setEditingWritingEntryId(entryId);
      setWritingQuestion(target.prompt);
    },
    [isWritingBusy, setActiveTab, writingResponses]
  );

  const handleRegenerateWritingResponse = useCallback(
    (entryId: number) => {
      if (writingRequestLockRef.current || isWritingBusy) {
        return;
      }

      const target = writingResponses.find((entry) => entry.id === entryId);
      if (!target || target.isLoading) {
        return;
      }

      const promptText = target.prompt.trim();
      if (!promptText) {
        return;
      }

      writingRequestIdRef.current = Math.max(writingRequestIdRef.current, entryId);
      void runWritingAssistantRequest(entryId, promptText, 'replace');
    },
    [isWritingBusy, runWritingAssistantRequest, writingResponses]
  );

  const handleSelectWritingSession = useCallback(
    (sessionId: string) => {
      if (sessionId === activeWritingSessionId) return;

      const session = writingSessions.find((entry) => entry.id === sessionId);
      if (!session) return;

      writingSessionIdRef.current = sessionId;
      writingRequestIdRef.current = session.responses.reduce((max, entry) => Math.max(max, entry.id), 0);
      writingRequestLockRef.current = false;
      writingSessionCreatedAtRef.current = session.createdAt;

      setActiveWritingSessionId(sessionId);
      setIsActiveWritingSessionSaved(true);
      setWritingResponses(session.responses);
      setWritingQuestion('');
      setIsWritingResponding(false);
      setEditingWritingEntryId(null);
      setLatestWritingActionId(
        session.responses.length > 0 ? session.responses[session.responses.length - 1].id : null
      );
    },
    [activeWritingSessionId, writingSessions]
  );

  const handleDeleteWritingSession = useCallback(
    async (sessionId: string) => {
      const sessionsSnapshot = writingSessionsRef.current;
      const sessionExists = sessionsSnapshot.some((session) => session.id === sessionId);

      if (!sessionExists) {
        return;
      }

      const filteredSessions = sessionsSnapshot.filter((session) => session.id !== sessionId);
      const relabeledSessions = filteredSessions.map((session, index) => ({
        ...session,
        label: `Session ${index + 1}`,
      }));

      if (noteId) {
        try {
          await deleteNoteWritingAssistantSession(noteId, sessionId);
        } catch (error) {
          console.error('Failed to delete writing assistant session', error);
          toast.error('Failed to delete session. Please try again.');
          return;
        }
      }

      writingSessionsRef.current = relabeledSessions;
      setWritingSessions(relabeledSessions);
      toast.success('Session deleted');

      const isDeletingActiveSession = isActiveWritingSessionSaved && activeWritingSessionId === sessionId;

      if (!isDeletingActiveSession) {
        return;
      }

      const nextSession = relabeledSessions[0];

      if (nextSession) {
        writingSessionIdRef.current = nextSession.id;
        writingSessionCreatedAtRef.current = nextSession.createdAt;
        writingRequestIdRef.current = nextSession.responses.reduce((max, entry) => Math.max(max, entry.id), 0);
        writingRequestLockRef.current = false;

        setActiveWritingSessionId(nextSession.id);
        setIsActiveWritingSessionSaved(true);
        setWritingResponses(nextSession.responses);
        setWritingQuestion('');
        setIsWritingResponding(false);
        setEditingWritingEntryId(null);
        setLatestWritingActionId(
          nextSession.responses.length > 0 ? nextSession.responses[nextSession.responses.length - 1].id : null
        );
        return;
      }

      initializeWritingSession();
    },
    [
      activeWritingSessionId,
      initializeWritingSession,
      isActiveWritingSessionSaved,
      noteId,
      setActiveWritingSessionId,
      setIsActiveWritingSessionSaved,
      setIsWritingResponding,
      setWritingResponses,
      setWritingSessions,
      setWritingQuestion,
    ]
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
  const runMarkdownAssistantRequest = useCallback(
    async (entryId: number, promptText: string, mode: 'append' | 'replace') => {
      const normalizedPrompt = promptText.trim();
      setLatestMarkdownActionId(entryId);

      if (!normalizedPrompt) {
        setMarkdownQuestion('');
        if (mode === 'replace') {
          setEditingMarkdownEntryId(null);
        }
        return;
      }

      markdownRequestLockRef.current = true;
      setIsMarkdownResponding(true);

      setMarkdownResponses((prev) => {
        let updated: ConversationEntry[];

        if (mode === 'replace') {
          let found = false;
          updated = prev.map((entry) => {
            if (entry.id !== entryId) {
              return entry;
            }

            found = true;
            return {
              ...entry,
              prompt: normalizedPrompt,
              response: '',
              isLoading: true,
            };
          });

          if (!found) {
            updated = [
              ...prev,
              {
                id: entryId,
                prompt: normalizedPrompt,
                response: '',
                isLoading: true,
              },
            ];
          }
        } else {
          updated = [
            ...prev,
            {
              id: entryId,
              prompt: normalizedPrompt,
              response: '',
              isLoading: true,
            },
          ];
        }

        return updated;
      });

      setMarkdownQuestion('');
      if (mode === 'replace') {
        setEditingMarkdownEntryId(null);
      }

      try {
        const aiResponse = await fetchMarkdownManual(normalizedPrompt, markdownSessionIdRef.current);

        setMarkdownResponses((prev) =>
          prev.map((entry) =>
            entry.id === entryId ? { ...entry, response: aiResponse, isLoading: false } : entry
          )
        );
      } catch (error) {
        console.error('Markdown manual response error', error);
        setMarkdownResponses((prev) =>
          prev.map((entry) =>
            entry.id === entryId
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
    },
    []
  );

  const handleMarkdownSearch = useCallback(async () => {
    const trimmedQuestion = markdownQuestion.trim();
    if (!trimmedQuestion || markdownRequestLockRef.current) return;

    if (editingMarkdownEntryId !== null) {
      markdownRequestIdRef.current = Math.max(markdownRequestIdRef.current, editingMarkdownEntryId);
      await runMarkdownAssistantRequest(editingMarkdownEntryId, trimmedQuestion, 'replace');
      return;
    }

    if (isMarkdownBusy) return;

    const requestId = markdownRequestIdRef.current + 1;
    markdownRequestIdRef.current = requestId;

    await runMarkdownAssistantRequest(requestId, trimmedQuestion, 'append');
  }, [editingMarkdownEntryId, isMarkdownBusy, markdownQuestion, runMarkdownAssistantRequest]);

  const handleStartEditingMarkdownPrompt = useCallback(
    (entryId: number) => {
      if (markdownRequestLockRef.current || isMarkdownBusy) {
        return;
      }

      const target = markdownResponses.find((entry) => entry.id === entryId);
      if (!target || target.isLoading) {
        return;
      }

      setActiveTab(1);
      setEditingMarkdownEntryId(entryId);
      setMarkdownQuestion(target.prompt);
    },
    [isMarkdownBusy, markdownResponses, setActiveTab]
  );

  const handleRegenerateMarkdownResponse = useCallback(
    (entryId: number) => {
      if (markdownRequestLockRef.current || isMarkdownBusy) {
        return;
      }

      const target = markdownResponses.find((entry) => entry.id === entryId);
      if (!target || target.isLoading) {
        return;
      }

      const promptText = target.prompt.trim();
      if (!promptText) {
        return;
      }

      markdownRequestIdRef.current = Math.max(markdownRequestIdRef.current, entryId);
      void runMarkdownAssistantRequest(entryId, promptText, 'replace');
    },
    [isMarkdownBusy, markdownResponses, runMarkdownAssistantRequest]
  );

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
    latestWritingActionId ??
    (writingResponses.length > 0 ? writingResponses[writingResponses.length - 1].id : null);

  const latestMarkdownResponseId =
    latestMarkdownActionId ??
    (markdownResponses.length > 0 ? markdownResponses[markdownResponses.length - 1].id : null);

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
                  onDelete={handleDeleteWritingSession}
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
                    onEditPrompt={handleStartEditingWritingPrompt}
                    onRegenerateResponse={handleRegenerateWritingResponse}
                    editingPromptId={editingWritingEntryId}
                    disableActions={isWritingBusy || writingRequestLockRef.current}
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
              className="flex flex-1 flex-col p-4"
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
                onEditPrompt={handleStartEditingMarkdownPrompt}
                onRegenerateResponse={handleRegenerateMarkdownResponse}
                editingPromptId={editingMarkdownEntryId}
                disableActions={isMarkdownBusy || markdownRequestLockRef.current}
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
