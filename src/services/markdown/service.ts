import { updateNoteContent, updateFavoriteNoteTitle } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';

const auth = getAuth(firebaseApp);

export interface SaveNoteParams {
  pageId: string;
  title: string;
  content: string;
  publishContent: string;
  isPublic?: boolean;
  isPublished?: boolean;
  thumbnailUrl?: string;
  updatedAt?: Date;
  onSaveTitle?: (title: string) => void;
}

export interface SaveNoteOptions {
  isAutoSave?: boolean;
  data?: {
    title: string;
    content: string;
    updatedAt?: Date;
  };
}

export interface PublishNoteParams {
  pageId: string;
  title: string;
  content: string;
  publishContent: string;
  thumbnailUrl?: string;
  isPublished?: boolean;
  publishTitle?: string;
  publishContentFromPublishScreen?: string;
  onSaveTitle?: (title: string) => void;
  setPublishContent?: (content: string) => void;
  setShowMarkdownPublishScreen?: (show: boolean) => void;
}

export const handleSave = async (
  params: SaveNoteParams,
  options: SaveNoteOptions = {}
): Promise<void> => {
  const { isAutoSave = false, data } = options;
  
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const noteTitle = isAutoSave && data ? data.title : params.title;
  const noteContent = isAutoSave && data ? data.content : params.content;

  // Add validation for manual save
  if (!isAutoSave) {
    if (!noteTitle.trim() || noteTitle.length === 0) {
      toast.error('Please enter a title');
      return;
    }
    if ((!noteContent.trim() || noteContent.length === 0) && !params.updatedAt) {
      toast.error('Content cannot be empty');
      return;
    }
  }

  try {
    await updateNoteContent(
      params.pageId,
      noteTitle || 'Untitled',
      noteTitle || 'Untitled', // publishTitle same as title
      noteContent,
      params.publishContent,
      params.isPublic,
      params.isPublished,
      params.thumbnailUrl // No thumbnail for auto-save
    );

    await updateFavoriteNoteTitle(params.pageId, noteTitle);

    if (params.onSaveTitle) {
      params.onSaveTitle(noteTitle);
    }

    if (!isAutoSave) {
      toast.success('Note saved successfully!');
    } else {
      console.log('Auto-saved successfully');
    }
  } catch (error) {
    const errorMessage = `Failed to save note${isAutoSave ? ' (auto-save)' : ''}`;
    console.error(`${errorMessage}:`, error);
    toast.error(errorMessage);
    throw error;
  }
};

export const handlePublish = async (params: PublishNoteParams): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  try {
    // If publishContent is provided from modal, update the context
    if (params.publishContentFromPublishScreen && params.setPublishContent) {
      params.setPublishContent(params.publishContentFromPublishScreen);
    }

    await updateNoteContent(
      params.pageId,
      params.title,
      params.publishTitle || params.title,
      params.content,
      params.publishContentFromPublishScreen || params.publishContent,
      true, // isPublic for publishing
      params.isPublished,
      params.thumbnailUrl
    );

    // Call the onSaveTitle callback if provided
    if (params.onSaveTitle) {
      params.onSaveTitle(params.title);
    }

    toast.success(params.isPublished ? 'Note published successfully!' : 'Note saved as draft!');
    
    if (params.setShowMarkdownPublishScreen) {
      params.setShowMarkdownPublishScreen(false);
    }
  } catch (error) {
    console.error('Error publishing note:', error);
    toast.error('Failed to publish note');
    throw error;
  }
};

export const createHandleSaveParams = (
  pageId: string,
  title: string,
  content: string,
  publishContent: string,
  isPublic?: boolean,
  isPublished?: boolean,
  thumbnailUrl?: string,
  updatedAt?: Date,
  onSaveTitle?: (title: string) => void
): SaveNoteParams => ({
  pageId,
  title,
  content,
  publishContent,
  isPublic,
  isPublished,
  thumbnailUrl,
  updatedAt,
  onSaveTitle,
});

export const createHandlePublishParams = (
  pageId: string,
  title: string,
  content: string,
  publishContent: string,
  thumbnailUrl?: string,
  isPublished?: boolean,
  publishTitle?: string,
  publishContentFromPublishScreen?: string,
  onSaveTitle?: (title: string) => void,
  setPublishContent?: (content: string) => void,
  setShowMarkdownPublishScreen?: (show: boolean) => void
): PublishNoteParams => ({
  pageId,
  title,
  content,
  publishContent,
  thumbnailUrl,
  isPublished,
  publishTitle,
  publishContentFromPublishScreen,
  onSaveTitle,
  setPublishContent,
  setShowMarkdownPublishScreen,
});