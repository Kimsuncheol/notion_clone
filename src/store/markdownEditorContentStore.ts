import { create } from 'zustand';

interface MarkdownEditorContentStore {
  content: string;
  title: string;
  viewMode: 'split' | 'preview';
  authorEmail: string | null;
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  setViewMode: (viewMode: 'split' | 'preview') => void;
  setAuthorEmail: (authorEmail: string | null) => void;
}

export const useMarkdownEditorContentStore = create<MarkdownEditorContentStore>((set) => ({
  content: '',
  title: '',
  viewMode: 'preview',
  authorEmail: null,
  setContent: (content) => set({ content }),
  setTitle: (title) => set({ title }),
  setViewMode: (viewMode) => set({ viewMode }),
  setAuthorEmail: (authorEmail) => set({ authorEmail }),
}));