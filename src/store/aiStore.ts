import { create } from 'zustand'

interface RefreshRequest {
  sessionId: string
  requestId: number
}

export interface AISessionPreview {
  sessionId: string
  summary?: string | null
}

interface AIStore {
  recentlyOpenSessionID: string | null
  sessions: AISessionPreview[]
  refreshRequest: RefreshRequest | null
  setRecentlyOpenSessionID: (sessionID: string | null) => void
  addSessionId: (session: string | AISessionPreview) => void
  removeSessionId: (sessionID: string) => void
  setSessionIds: (sessions: Array<string | AISessionPreview>) => void
  updateSessionSummary: (sessionID: string, summary?: string | null) => void
  triggerRefreshSession: (sessionID: string) => void
  clearRefreshRequest: (requestId?: number) => void
  resetSessionIds: () => void
}

const normalizeSessionInput = (session: string | AISessionPreview): AISessionPreview | null => {
  if (typeof session === 'string') {
    const normalized = session.trim()
    return normalized ? { sessionId: normalized, summary: null } : null
  }

  const sessionId = session.sessionId?.trim()
  if (!sessionId) {
    return null
  }

  const summary =
    typeof session.summary === 'string' && session.summary.trim().length > 0
      ? session.summary.trim()
      : session.summary ?? null

  return { sessionId, summary }
}

export const useAIStore = create<AIStore>((set) => ({
  recentlyOpenSessionID: null,
  sessions: [],
  refreshRequest: null,
  setRecentlyOpenSessionID: (sessionID) => set({ recentlyOpenSessionID: sessionID }),
  addSessionId: (session) =>
    set((state) => {
      const normalized = normalizeSessionInput(session)
      if (!normalized) {
        return state
      }

      const existingIndex = state.sessions.findIndex(
        (existing) => existing.sessionId === normalized.sessionId,
      )

      if (existingIndex !== -1) {
        const existing = state.sessions[existingIndex]
        const shouldUpdateSummary =
          normalized.summary !== undefined &&
          normalized.summary !== null &&
          normalized.summary !== existing.summary

        if (!shouldUpdateSummary) {
          return state
        }

        const updatedSessions = [...state.sessions]
        updatedSessions[existingIndex] = {
          ...existing,
          summary: normalized.summary,
        }

        return {
          ...state,
          sessions: updatedSessions,
        }
      }

      return {
        ...state,
        sessions: [normalized, ...state.sessions],
      }
    }),
  removeSessionId: (sessionID) =>
    set((state) => {
      if (!sessionID) {
        return state
      }

      const updatedSessions = state.sessions.filter((session) => session.sessionId !== sessionID)
      const recentlyOpenSessionID =
        state.recentlyOpenSessionID === sessionID ? null : state.recentlyOpenSessionID

      return {
        ...state,
        sessions: updatedSessions,
        recentlyOpenSessionID,
      }
    }),
  setSessionIds: (sessions) =>
    set((state) => {
      const orderedUnique = sessions.reduce<AISessionPreview[]>((unique, item) => {
        const normalized = normalizeSessionInput(item)
        if (!normalized) {
          return unique
        }

        if (unique.some((existing) => existing.sessionId === normalized.sessionId)) {
          return unique
        }

        unique.push(normalized)
        return unique
      }, [])

      const recentlyOpenSessionID =
        state.recentlyOpenSessionID &&
        orderedUnique.some((session) => session.sessionId === state.recentlyOpenSessionID)
          ? state.recentlyOpenSessionID
          : orderedUnique[0]?.sessionId ?? null

      return {
        ...state,
        sessions: orderedUnique,
        recentlyOpenSessionID,
      }
    }),
  updateSessionSummary: (sessionID, summary) =>
    set((state) => {
      if (!sessionID) {
        return state
      }

      const index = state.sessions.findIndex((session) => session.sessionId === sessionID)
      if (index === -1) {
        return state
      }

      const normalizedSummary =
        typeof summary === 'string' && summary.trim().length > 0 ? summary.trim() : summary ?? null

      if (state.sessions[index].summary === normalizedSummary) {
        return state
      }

      const updatedSessions = [...state.sessions]
      updatedSessions[index] = {
        ...state.sessions[index],
        summary: normalizedSummary,
      }

      return {
        ...state,
        sessions: updatedSessions,
      }
    }),
  triggerRefreshSession: (sessionID) => {
    if (!sessionID) {
      return
    }

    set({ refreshRequest: { sessionId: sessionID, requestId: Date.now() } })
  },
  clearRefreshRequest: (requestId) =>
    set((state) => {
      if (!state.refreshRequest) {
        return state
      }

      if (typeof requestId === 'number' && state.refreshRequest.requestId !== requestId) {
        return state
      }

      return {
        ...state,
        refreshRequest: null,
      }
    }),
  resetSessionIds: () => set({ recentlyOpenSessionID: null, sessions: [], refreshRequest: null }),
}))
