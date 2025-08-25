import { create } from 'zustand';

interface MarkdownEditorContentStore {
  content: string;
  title: string;
  viewMode: 'split' | 'preview';
  authorEmail: string | null;
  showSpecialCharactersModal: boolean;
  showEmojiPicker: boolean;
  showLaTeXModal: boolean;
  showMarkdownBottomBar: boolean;
  showMarkdownPublishScreen: boolean;
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  setViewMode: (viewMode: 'split' | 'preview') => void;
  setAuthorEmail: (authorEmail: string | null) => void;
  setShowSpecialCharactersModal: (showSpecialCharactersModal: boolean) => void;
  setShowEmojiPicker: (showEmojiPicker: boolean) => void;
  setShowLaTeXModal: (showLaTeXModal: boolean) => void;
  setShowMarkdownBottomBar: (showMarkdownBottomBar: boolean) => void;
  setShowMarkdownPublishScreen: (showMarkdownPublishScreen: boolean) => void;
}

export const useMarkdownEditorContentStore = create<MarkdownEditorContentStore>((set) => ({
  content: '',
  title: '',
  viewMode: 'preview',
  authorEmail: null,
  showSpecialCharactersModal: false,
  showEmojiPicker: false,
  showLaTeXModal: false,
  showMarkdownBottomBar: true,
  showMarkdownPublishScreen: false,
  setContent: (content) => set({ content }),
  setTitle: (title) => set({ title }),
  setViewMode: (viewMode) => set({ viewMode }),
  setAuthorEmail: (authorEmail) => set({ authorEmail }),
  setShowSpecialCharactersModal: (showSpecialCharactersModal) => set({ showSpecialCharactersModal }),
  setShowEmojiPicker: (showEmojiPicker) => set({ showEmojiPicker }),
  setShowLaTeXModal: (showLaTeXModal) => set({ showLaTeXModal }),
  setShowMarkdownBottomBar: (showMarkdownBottomBar) => set({ showMarkdownBottomBar }),
  setShowMarkdownPublishScreen: (showMarkdownPublishScreen) => set({ showMarkdownPublishScreen }),
}));