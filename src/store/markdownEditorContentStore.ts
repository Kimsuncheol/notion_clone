import { MySeries, TagType } from '@/types/firebase';
import { create } from 'zustand';

interface MarkdownStore {
  deleteNoteId: string;
  content: string;
  title: string;
  description: string;
  summary: string;
  isSaving: boolean;
  viewMode: 'split' | 'preview';
  showSpecialCharactersModal: boolean;
  showEmojiPicker: boolean;
  showLaTeXModal: boolean;
  showMarkdownBottomBar: boolean;
  showMarkdownPublishScreen: boolean;
  showDeleteConfirmation: boolean;
  tags: TagType[];
  series: MySeries[];
  selectedSeries: MySeries | null;
  isBeingEditedCommentId: string | null;
  isBeingEditedReplyId: string | null;
  isShowingRepliesCommentId: string | null;
  thumbnailUrl: string | null;
  // author
  authorEmail: string | null;
  authorAvatar: string | null;
  // current user
  avatar: string | null;
  displayName: string | null;
  showQRCodeModalForMarkdownEditor: boolean;
  showChatModal: boolean;
  visibility: 'public' | 'private';
  setDeleteNoteId: (deleteNoteId: string) => void;
  setContent: (content: string) => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setSummary: (summary: string) => void;
  setIsSaving: (isSaving: boolean) => void;
  setViewMode: (viewMode: 'split' | 'preview') => void;
  setAuthorEmail: (authorEmail: string | null) => void;
  setShowSpecialCharactersModal: (showSpecialCharactersModal: boolean) => void;
  setShowEmojiPicker: (showEmojiPicker: boolean) => void;
  setShowLaTeXModal: (showLaTeXModal: boolean) => void;
  setShowMarkdownBottomBar: (showMarkdownBottomBar: boolean) => void;
  setShowMarkdownPublishScreen: (showMarkdownPublishScreen: boolean) => void;
  setShowDeleteConfirmation: (showDeleteConfirmation: boolean) => void;
  setTags: (tags: TagType[]) => void;
  setSeries: (series: MySeries[]) => void;
  setSelectedSeries: (selectedSeries: MySeries | null) => void;
  setIsBeingEditedCommentId: (isBeingEditedCommentId: string | null) => void;
  setIsBeingEditedReplyId: (isBeingEditedReplyId: string | null) => void;
  handleEditStateSetter: (isBeingEditedCommentId: string | null, isBeingEditedReplyId: string | null) => void;
  setIsShowingRepliesCommentId: (isShowingRepliesCommentId: string | null) => void;
  setThumbnailUrl: (thumbnailUrl: string | null) => void;
  setAvatar: (photoURL: string | null) => void;
  setAuthorAvatar: (authorAvatar: string | null) => void;
  setDisplayName: (displayName: string | null) => void;
  setShowQRCodeModalForMarkdownEditor: (showQRCodeModalForMarkdownEditor: boolean) => void;
  setVisibility: (visibility: 'public' | 'private') => void;
}

export const useMarkdownStore = create<MarkdownStore>((set) => ({
  deleteNoteId: '',
  content: '',
  title: '',
  description: '',
  summary: '',
  isSaving: false,
  viewMode: 'preview',
  authorEmail: null,
  showSpecialCharactersModal: false,
  showEmojiPicker: false,
  showLaTeXModal: false,
  showMarkdownBottomBar: true,
  showMarkdownPublishScreen: false,
  showDeleteConfirmation: false,
  tags: [],
  series: [],
  selectedSeries: null,
  isBeingEditedCommentId: null,
  isBeingEditedReplyId: null,
  isShowingRepliesCommentId: null,
  thumbnailUrl: null,
  avatar: null,
  authorAvatar: null,
  displayName: null,
  showQRCodeModalForMarkdownEditor: false,
  showChatModal: false,
  visibility: 'public',
  setDeleteNoteId: (deleteNoteId) => set({ deleteNoteId }),
  setContent: (content) => set({ content }),
  setTitle: (title) => set({ title }),
  setDescription: (description) => set({ description }),
  setSummary: (summary) => set({ summary }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setViewMode: (viewMode) => set({ viewMode }),
  setAuthorEmail: (authorEmail) => set({ authorEmail }),
  setShowSpecialCharactersModal: (showSpecialCharactersModal) => set({ showSpecialCharactersModal }),
  setShowEmojiPicker: (showEmojiPicker) => set({ showEmojiPicker }),
  setShowLaTeXModal: (showLaTeXModal) => set({ showLaTeXModal }),
  setShowMarkdownBottomBar: (showMarkdownBottomBar) => set({ showMarkdownBottomBar }),
  setShowMarkdownPublishScreen: (showMarkdownPublishScreen) => set({ showMarkdownPublishScreen }),
  setShowDeleteConfirmation: (showDeleteConfirmation) => set({ showDeleteConfirmation }),
  setTags: (tags) => set({ tags }),
  setSeries: (series) => set({ series }),
  setSelectedSeries: (selectedSeries) => set({ selectedSeries }),
  setIsBeingEditedCommentId: (isBeingEditedCommentId) => set({ isBeingEditedCommentId }),
  setIsBeingEditedReplyId: (isBeingEditedReplyId) => set({ isBeingEditedReplyId }),
  handleEditStateSetter: (isBeingEditedCommentId, isBeingEditedReplyId) => set({ isBeingEditedCommentId, isBeingEditedReplyId }),
  setIsShowingRepliesCommentId: (isShowingRepliesCommentId) => set({ isShowingRepliesCommentId }),
  setThumbnailUrl: (thumbnailUrl) => set({ thumbnailUrl }),
  setAvatar: (avatar) => set({ avatar }),
  setAuthorAvatar: (authorAvatar) => set({ authorAvatar }),
  setDisplayName: (displayName) => set({ displayName }),
  setShowQRCodeModalForMarkdownEditor: (showQRCodeModalForMarkdownEditor) => set({ showQRCodeModalForMarkdownEditor }),
  setVisibility: (visibility) => set({ visibility }),
}));
