import { create } from 'zustand'

import { generateUUID } from '@/utils/generateUUID'

export type AISessionTab = {
  label: string
  sessionId: string
  order: number
}

const LABELS = Array.from({ length: 10 }, (_, index) => `text ${index + 1}`)

const createSession = (order: number): AISessionTab => ({
  label: LABELS[order] ?? `text ${order + 1}`,
  sessionId: generateUUID(),
  order,
})

interface AISessionStore {
  sessions: AISessionTab[]
  regenerateSession: (sessionId: string) => void
}

export const useAISessionStore = create<AISessionStore>((set) => ({
  sessions: LABELS.map((_, index) => createSession(index)),
  regenerateSession: (sessionId) =>
    set((state) => {
      const idx = state.sessions.findIndex((session) => session.sessionId === sessionId)
      if (idx === -1) {
        return state
      }

      const nextSessions = [...state.sessions]
      nextSessions[idx] = createSession(nextSessions[idx].order)
      return { sessions: nextSessions }
    }),
}))

export const getAISessionTabs = () => useAISessionStore.getState().sessions
