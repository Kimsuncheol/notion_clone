import { create } from 'zustand';

interface AddaSubNoteSidebarStore {
  content: string;
  showEmojiPicker: boolean;
  isAddImageOn: boolean;
  isAddCommentOn: boolean;
  isImageOn: boolean;
  isMiniMarkdownToolbarOn: boolean;
  imageUrl: string;
  isSelectNoteModalOpen: boolean;
  selectedNoteId: string | null;
  selectedNoteTitle: string;
  subNoteId: string;
  canCloseSubNotePage: boolean;
  selectedSubNoteId: string | null;
  isInitializingSubNote: boolean;
  hasLeftComment: boolean;
  comments: Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
    comments?: Array<{
      id: string;
      text: string;
      author: string;
      authorEmail: string;
      timestamp: Date;
    }>;
  }>;
  viewMode: 'split' | 'preview';
  authorEmail: string;
  showMoreOptionsModalForSubnote: boolean;
  noteTitle: string;
  setContent: (content: string) => void;
  setImageUrl: (imageUrl: string) => void;
  setIsSelectNoteModalOpen: (isSelectNoteModalOpen: boolean) => void;
  setShowEmojiPicker: (showEmojiPicker: boolean) => void;
  setIsAddImageOn: (isAddImageOn: boolean) => void;
  setIsAddCommentOn: (isAddCommentOn: boolean) => void;
  setIsImageOn: (isImageOn: boolean) => void;
  setIsMiniMarkdownToolbarOn: (isMiniMarkdownToolbarOn: boolean) => void;
  setSelectedNoteId: (selectedNoteId: string | null) => void;
  setSelectedNoteTitle: (selectedNoteTitle: string) => void;
  setSubNoteId: (subNoteId: string) => void;
  setCanCloseSubNotePage: (canCloseSubNotePage: boolean) => void;
  setSelectedSubNoteId: (selectedSubNoteId: string | null) => void;
  setSelectedParentSubNoteId: (selectedNoteId: string, selectedSubNoteId: string) => void;
  setIsInitializingSubNote: (isInitializing: boolean) => void;
  setHasLeftComment: (hasLeftComment: boolean) => void;
  setComments: (comments: Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
  }>) => void;
  setViewMode: (viewMode: 'split' | 'preview') => void;
  setAuthorEmail: (authorEmail: string) => void;
  setShowMoreOptionsModalForSubnote: (showMoreOptionsModalForSubnote: boolean) => void;
  setNoteTitle: (noteTitle: string) => void;
}

export const useAddaSubNoteSidebarStore = create<AddaSubNoteSidebarStore>((set) => ({
  content: '',
  showEmojiPicker: false,
  isAddImageOn: false,
  isAddCommentOn: false,
  isImageOn: false,
  isMiniMarkdownToolbarOn: false,
  isSelectNoteModalOpen: false,
  imageUrl: '',
  selectedNoteId: null,
  selectedNoteTitle: '',
  subNoteId: '',
  canCloseSubNotePage: false,
  selectedSubNoteId: null,
  isInitializingSubNote: false,
  hasLeftComment: false,
  comments: [],
  viewMode: 'split',
  authorEmail: '',
  showMoreOptionsModalForSubnote: false,
  noteTitle: '',
  setContent: (content) => set({ content }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setShowEmojiPicker: (showEmojiPicker) => set({ showEmojiPicker }),
  setIsAddImageOn: (isAddImageOn) => set({ isAddImageOn }),
  setIsAddCommentOn: (isAddCommentOn) => set({ isAddCommentOn }),
  setIsImageOn: (isImageOn) => set({ isImageOn }),
  setIsMiniMarkdownToolbarOn: (isMiniMarkdownToolbarOn) => set({ isMiniMarkdownToolbarOn }),
  setIsSelectNoteModalOpen: (isSelectNoteModalOpen) => set({ isSelectNoteModalOpen }),
  setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
  setSelectedNoteTitle: (selectedNoteTitle) => set({ selectedNoteTitle }),
  setSubNoteId: (subNoteId) => set({ subNoteId }),
  setCanCloseSubNotePage: (canCloseSubNotePage) => set({ canCloseSubNotePage }),
  setSelectedSubNoteId: (selectedSubNoteId) => set({ selectedSubNoteId }),
  setSelectedParentSubNoteId: (selectedNoteId, selectedSubNoteId) => set({ selectedNoteId, selectedSubNoteId }),
  setIsInitializingSubNote: (isInitializing) => set({ isInitializingSubNote: isInitializing }),
  setHasLeftComment: (hasLeftComment) => set({ hasLeftComment }),
  setComments: (comments) => set({ comments }),
  setViewMode: (viewMode ) => set({ viewMode }),
  setAuthorEmail: (authorEmail) => set({ authorEmail }),
  setShowMoreOptionsModalForSubnote: (showMoreOptionsModalForSubnote) => set({ showMoreOptionsModalForSubnote }),
  setNoteTitle: (noteTitle) => set({ noteTitle }),
}));