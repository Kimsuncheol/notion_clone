import { create } from 'zustand';

interface AddaSubNoteSidebarStore {
  content: string;
  setContent: (content: string) => void;
  isAddIconOn: boolean;
  isAddImageOn: boolean;
  isAddCommentOn: boolean;
  isImageOn: boolean;
  isMiniMarkdownToolbarOn: boolean;
  imageUrl: string;
  setImageUrl: (imageUrl: string) => void;
  setIsAddIconOn: (isAddIconOn: boolean) => void;
  setIsAddImageOn: (isAddImageOn: boolean) => void;
  setIsAddCommentOn: (isAddCommentOn: boolean) => void;
  setIsImageOn: (isImageOn: boolean) => void;
  setIsMiniMarkdownToolbarOn: (isMiniMarkdownToolbarOn: boolean) => void;
}

export const useAddaSubNoteSidebarStore = create<AddaSubNoteSidebarStore>((set) => ({
  content: '',
  setContent: (content) => set({ content }),
  isAddIconOn: false,
  isAddImageOn: false,
  isAddCommentOn: false,
  isImageOn: false,
  isMiniMarkdownToolbarOn: false,
  imageUrl: '',
  setImageUrl: (imageUrl) => set({ imageUrl }),
  setIsAddIconOn: (isAddIconOn) => set({ isAddIconOn }),
  setIsAddImageOn: (isAddImageOn) => set({ isAddImageOn }),
  setIsAddCommentOn: (isAddCommentOn) => set({ isAddCommentOn }),
  setIsImageOn: (isImageOn) => set({ isImageOn }),
  setIsMiniMarkdownToolbarOn: (isMiniMarkdownToolbarOn) => set({ isMiniMarkdownToolbarOn }),
}));