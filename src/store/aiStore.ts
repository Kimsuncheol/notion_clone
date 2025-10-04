import { create } from 'zustand'
import { AIChatbotSessionId } from '@/types/firebase';

interface AIStore {
  recentlyOpenSessionID: AIChatbotSessionId | null;
  setRecentlyOpenSessionID: (sessionID: AIChatbotSessionId | null) => void;
}

export const useAIStore = create<AIStore>((set) => ({
  recentlyOpenSessionID: null,
  setRecentlyOpenSessionID: (sessionID) => set({ recentlyOpenSessionID: sessionID }),
}))