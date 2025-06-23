import { create } from 'zustand';

interface ColorState {
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

export const useColorStore = create<ColorState>((set) => ({
  backgroundColor: '#262626',
  setBackgroundColor: (color: string) => set({ backgroundColor: color }),
})); 