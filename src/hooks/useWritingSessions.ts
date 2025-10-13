import { useState, useCallback } from 'react';
import { generateUUID } from '@/utils/generateUUID';

type ConversationEntry = {
  id: number;
  prompt: string;
  response: string;
  isLoading: boolean;
};

type WritingSession = {
  id: string;
  name: string;
  sessionId: string;
  responses: ConversationEntry[];
  question: string;
  isResponding: boolean;
  hasInitialResponseFetched: boolean;
  requestIdRef: number;
  requestLockRef: boolean;
};

export function useWritingSessions() {
  const [sessions, setSessions] = useState<WritingSession[]>([
    {
      id: generateUUID(),
      name: 'Session 1',
      sessionId: generateUUID(),
      responses: [],
      question: '',
      isResponding: false,
      hasInitialResponseFetched: false,
      requestIdRef: 0,
      requestLockRef: false,
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);

  const currentSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  const updateCurrentSession = useCallback(
    (updates: Partial<WritingSession>) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId ? { ...session, ...updates } : session
        )
      );
    },
    [activeSessionId]
  );

  const setQuestion = useCallback(
    (question: string) => {
      updateCurrentSession({ question });
    },
    [updateCurrentSession]
  );

  const setResponses = useCallback(
    (updater: ConversationEntry[] | ((prev: ConversationEntry[]) => ConversationEntry[])) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                responses: typeof updater === 'function' ? updater(session.responses) : updater,
              }
            : session
        )
      );
    },
    [activeSessionId]
  );

  const setIsResponding = useCallback(
    (isResponding: boolean) => {
      updateCurrentSession({ isResponding });
    },
    [updateCurrentSession]
  );

  const setHasInitialResponseFetched = useCallback(
    (hasInitialResponseFetched: boolean) => {
      updateCurrentSession({ hasInitialResponseFetched });
    },
    [updateCurrentSession]
  );

  const setRequestIdRef = useCallback(
    (requestIdRef: number) => {
      updateCurrentSession({ requestIdRef });
    },
    [updateCurrentSession]
  );

  const setRequestLockRef = useCallback(
    (requestLockRef: boolean) => {
      updateCurrentSession({ requestLockRef });
    },
    [updateCurrentSession]
  );

  const createNewSession = useCallback(() => {
    const newSession: WritingSession = {
      id: generateUUID(),
      name: `Session ${sessions.length + 1}`,
      sessionId: generateUUID(),
      responses: [],
      question: '',
      isResponding: false,
      hasInitialResponseFetched: false,
      requestIdRef: 0,
      requestLockRef: false,
    };
    setSessions((prev) => [...prev, newSession]);
    setActiveSessionId(newSession.id);
  }, [sessions.length]);

  const deleteSession = useCallback(
    (sessionId: string) => {
      if (sessions.length <= 1) return;

      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (sessionId === activeSessionId) {
          setActiveSessionId(filtered[0].id);
        }
        return filtered;
      });
    },
    [sessions.length, activeSessionId]
  );

  const resetAllSessions = useCallback(() => {
    const initialSession: WritingSession = {
      id: generateUUID(),
      name: 'Session 1',
      sessionId: generateUUID(),
      responses: [],
      question: '',
      isResponding: false,
      hasInitialResponseFetched: false,
      requestIdRef: 0,
      requestLockRef: false,
    };
    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  }, []);

  return {
    sessions,
    activeSessionId,
    currentSession,
    setActiveSessionId,
    setQuestion,
    setResponses,
    setIsResponding,
    setHasInitialResponseFetched,
    setRequestIdRef,
    setRequestLockRef,
    createNewSession,
    deleteSession,
    resetAllSessions,
  };
}
