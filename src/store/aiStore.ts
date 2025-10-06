import { create } from 'zustand'

interface AIStore {
  recentlyOpenSessionID: string | null
  sessionIds: string[]
  setRecentlyOpenSessionID: (sessionID: string | null) => void
  addSessionId: (sessionID: string) => void
  resetSessionIds: () => void
}

export const useAIStore = create<AIStore>((set) => ({
  recentlyOpenSessionID: null,
  sessionIds: [],
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
  resetSessionIds: () => set({ recentlyOpenSessionID: null, sessionIds: [] }),
}))
