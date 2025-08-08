import { create } from 'zustand';

interface TrashSidebarStore {
  count: number;
  setCount: (count: number) => void;
}

export const useTrashSidebarStore = create<TrashSidebarStore>((set) => ({
  count: 0,
  setCount: (count) => set({ count }),
}));