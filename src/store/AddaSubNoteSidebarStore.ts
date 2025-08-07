import { create } from 'zustand';

interface AddaSubNoteSidebarStore {
  content: string;
  isAddIconOn: boolean;
  isAddImageOn: boolean;
  isAddCommentOn: boolean;
  isImageOn: boolean;
  isMiniMarkdownToolbarOn: boolean;
  imageUrl: string;
  isSelectNoteModalOpen: boolean;
  selectedNoteId: string;
  selectedNoteTitle: string;
  subNoteId: string;
  canCloseSubNotePage: boolean;
  selectedSubNoteId: string;
  isInitializingSubNote: boolean;
  setContent: (content: string) => void;
  setImageUrl: (imageUrl: string) => void;
  setIsSelectNoteModalOpen: (isSelectNoteModalOpen: boolean) => void;
  setIsAddIconOn: (isAddIconOn: boolean) => void;
  setIsAddImageOn: (isAddImageOn: boolean) => void;
  setIsAddCommentOn: (isAddCommentOn: boolean) => void;
  setIsImageOn: (isImageOn: boolean) => void;
  setIsMiniMarkdownToolbarOn: (isMiniMarkdownToolbarOn: boolean) => void;
  setSelectedNoteId: (selectedNoteId: string) => void;
  setSelectedNoteTitle: (selectedNoteTitle: string) => void;
  setSubNoteId: (subNoteId: string) => void;
  setCanCloseSubNotePage: (canCloseSubNotePage: boolean) => void;
  setSelectedSubNoteId: (selectedSubNoteId: string) => void;
  setSelectedParentSubNoteId: (selectedNoteId: string, selectedSubNoteId: string) => void;
  setIsInitializingSubNote: (isInitializing: boolean) => void;
}

export const useAddaSubNoteSidebarStore = create<AddaSubNoteSidebarStore>((set) => ({
  content: '',
  isAddIconOn: false,
  isAddImageOn: false,
  isAddCommentOn: false,
  isImageOn: false,
  isMiniMarkdownToolbarOn: false,
  isSelectNoteModalOpen: false,
  imageUrl: '',
  selectedNoteId: '',
  selectedNoteTitle: '',
  subNoteId: '',
  canCloseSubNotePage: false,
  selectedSubNoteId: '',
  isInitializingSubNote: false,
  setContent: (content) => set({ content }),
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setIsAddIconOn: (isAddIconOn) => set({ isAddIconOn }),
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
}));