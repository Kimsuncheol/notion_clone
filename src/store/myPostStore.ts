import { create } from 'zustand';

interface MyPostStore {
  tab: 'posts' | 'series';
  setTab: (tab: 'posts' | 'series') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useMyPostStore = create<MyPostStore>((set) => ({
  tab: 'posts',
  setTab: (tab) => set({ tab }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));