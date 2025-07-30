import { create } from 'zustand';

interface ViewportSizeStore {
  width: number;
  height: number;
  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setViewportSize: (width: number, height: number) => void;
}

export const useViewportSizeStore = create<ViewportSizeStore>((set) => ({
  width: 0,
  height: 0,
  setWidth: (width) => set({ width }),
  setHeight: (height) => set({ height }),
  setViewportSize: (width, height) => set({ width, height }),
}));