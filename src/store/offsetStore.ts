import { create } from 'zustand';

interface OffsetStore {
  offsetX: number;
  offsetY: number;
  setOffsetX: (offsetX: number) => void;
  setOffsetY: (offsetY: number) => void;
  setOffset: (offsetX: number, offsetY: number) => void;
}

export const useOffsetStore = create<OffsetStore>((set) => ({
  offsetX: 0,
  offsetY: 0,
  setOffsetX: (offsetX: number) => set({ offsetX }),
  setOffsetY: (offsetY: number) => set({ offsetY }),
  setOffset: (offsetX: number, offsetY: number) => set({ offsetX, offsetY }),
}));