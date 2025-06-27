import { create } from 'zustand';

interface ColorState {
  backgroundColor: string;
  blueBackgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

export const useColorStore = create<ColorState>((set) => ({
  backgroundColor: '#262626',
  blueBackgroundColor: 'bg-[rgba(38, 38, 38, 0.8)]',
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
  setBlueBackgroundColor: (color: string) => set({ blueBackgroundColor: color }),
})); 