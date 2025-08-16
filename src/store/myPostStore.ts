import { create } from 'zustand';

interface MyPostStore {
  tab: 'posts' | 'series';
  setTab: (tab: 'posts' | 'series') => void;
}

export const useMyPostStore = create<MyPostStore>((set) => ({
  tab: 'posts',
  setTab: (tab) => set({ tab }),
}));