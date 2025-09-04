import { toast } from "react-hot-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AppDispatch } from "./index";
import { addToFavorites, removeFromFavorites, duplicateNote, getNoteTitle, moveToTrash, toggleNotePublic } from '@/services/firebase';

import { useIsPublicNoteStore } from "./isPublicNoteStore";
import { useSidebarStore } from "./sidebarStore";
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';

interface ActionParams {
  noteId: string;
  isPublic: boolean;
  isInFavorites: boolean;
  dispatch: AppDispatch;
  router: AppRouterInstance;
}

export const handleToggleFavorite = async ({ noteId, isInFavorites }: ActionParams) => {
  if (isInFavorites) {
    await removeFromFavorites(noteId);
    toast.success('Note removed from favorites');
  } else {
    await addToFavorites(noteId);
    toast.success('Note added to favorites');
  }
}

export const handleMoveToFolder = async ({ noteId }: ActionParams) => {
  const newIsPublic = await toggleNotePublic(noteId);
  useIsPublicNoteStore.getState().setIsPublic(newIsPublic);
  toast.success(`Note moved to the ${newIsPublic ? 'Private' : 'Public'} folder`);
}

export const handleMoveToTrash = async ({ noteId, router }: ActionParams) => {
  await moveToTrash(noteId);
  toast.success('Note moved to trash');

  // Redirect to dashboard after moving note to trash
  router.push('/dashboard');
}

export const handleDuplicateNote = async ({ noteId }: ActionParams) => {
  await duplicateNote(noteId);
  toast.success('Note duplicated');
}

export const handleCopyLink = async ({ noteId }: ActionParams) => {
  const noteUrl = `${window.location.origin}/note/${noteId}`;
  try {
    await navigator.clipboard.writeText(noteUrl);
    toast.success('Note link copied to clipboard!');
  } catch (error) {
    console.error('Error copying link:', error);
    toast.error('Failed to copy link');
  }
}

export const handleRenameNote = async ({ noteId }: ActionParams) => {
  useSidebarStore.getState().setSelectedPageIdToEditTitle(noteId);
}

export const handleOpenInNewTab = async ({ noteId }: ActionParams) => {
  const noteUrl = `${window.location.origin}/note/${noteId}`;
  window.open(noteUrl, '_blank');
}

export const handleOpenInSidePeek = async () => {
  // const noteUrl = `${window.location.origin}/note/${noteId}`;
  // window.open(noteUrl, '_blank');
}


