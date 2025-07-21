import { create } from 'zustand';

interface MarkdownEditorContentStore {
  content: string;
  setContent: (content: string) => void;
}

export const useMarkdownEditorContentStore = create<MarkdownEditorContentStore>((set) => ({
  content: '',
  setContent: (content) => set({ content }),
}));