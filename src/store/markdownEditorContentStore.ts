import { create } from 'zustand';

interface MarkdownEditorContentStore {
  content: string;
  viewMode: 'split' | 'preview';
  authorEmail: string | null;
  setContent: (content: string) => void;
  setViewMode: (viewMode: 'split' | 'preview') => void;
  setAuthorEmail: (authorEmail: string | null) => void;
}

export const useMarkdownEditorContentStore = create<MarkdownEditorContentStore>((set) => ({
  content: '',
  viewMode: 'preview',
  authorEmail: null,
  setContent: (content) => set({ content }),
  setViewMode: (viewMode) => set({ viewMode }),
  setAuthorEmail: (authorEmail) => set({ authorEmail }),
}));