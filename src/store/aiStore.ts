import { create } from 'zustand'

interface RefreshRequest {
  sessionId: string
  requestId: number
}

interface AIStore {
  recentlyOpenSessionID: string | null
  sessionIds: string[]
  refreshRequest: RefreshRequest | null
  setRecentlyOpenSessionID: (sessionID: string | null) => void
  addSessionId: (sessionID: string) => void
  removeSessionId: (sessionID: string) => void
  setSessionIds: (sessionIDs: string[]) => void
  triggerRefreshSession: (sessionID: string) => void
  clearRefreshRequest: (requestId?: number) => void
  resetSessionIds: () => void
}

export const useAIStore = create<AIStore>((set) => ({
  recentlyOpenSessionID: null,
  sessionIds: [],
  refreshRequest: null,
  setRecentlyOpenSessionID: (sessionID) => set({ recentlyOpenSessionID: sessionID }),
  addSessionId: (sessionID) =>
    set((state) => {
      if (!sessionID || state.sessionIds.includes(sessionID)) {
        return state
      }

      return {
        ...state,
        sessionIds: [sessionID, ...state.sessionIds],
      }
    }),
  removeSessionId: (sessionID) =>
    set((state) => {
      if (!sessionID || !state.sessionIds.includes(sessionID)) {
        return state
      }

      const updatedSessionIds = state.sessionIds.filter((id) => id !== sessionID)
      const recentlyOpenSessionID =
        state.recentlyOpenSessionID === sessionID ? null : state.recentlyOpenSessionID

      return {
        ...state,
        sessionIds: updatedSessionIds,
        recentlyOpenSessionID,
      }
    }),
  setSessionIds: (sessionIDs) =>
    set((state) => {
      const orderedUnique = sessionIDs.reduce<string[]>((unique, id) => {
        if (!id || unique.includes(id)) {
          return unique
        }

        unique.push(id)
        return unique
      }, [])

      const recentlyOpenSessionID =
        state.recentlyOpenSessionID && orderedUnique.includes(state.recentlyOpenSessionID)
          ? state.recentlyOpenSessionID
          : orderedUnique[0] ?? null

      return {
        ...state,
        sessionIds: orderedUnique,
        recentlyOpenSessionID,
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
  resetSessionIds: () => set({ recentlyOpenSessionID: null, sessionIds: [], refreshRequest: null }),
}))
