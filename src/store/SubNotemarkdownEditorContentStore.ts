import { create } from "zustand";

interface SubNoteMarkdownEditorContentStore {
  subNoteContent: string;
  setSubNoteContent: (subNoteContent: string) => void;
}

export const useSubNoteMarkdownEditorContentStore = create<SubNoteMarkdownEditorContentStore>((set) => ({
  subNoteContent: '',
  setSubNoteContent: (subNoteContent) => set({ subNoteContent }),
}));