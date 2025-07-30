import { create } from "zustand";

interface IsPublicNoteState {
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
}

export const useIsPublicNoteStore = create<IsPublicNoteState>((set) => ({
  isPublic: false,
  setIsPublic: (isPublic: boolean) => set({ isPublic }),
}));