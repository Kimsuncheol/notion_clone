import { create } from 'zustand'

interface InboxStore {
  activeTab: 'all' | 'unread'
  setActiveTab: (tab: 'all' | 'unread') => void
}

export const useInboxStore = create<InboxStore>((set) => ({
  activeTab: 'all',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))