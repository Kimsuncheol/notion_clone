import { toast } from "react-hot-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AppDispatch } from "./index";
import { addToFavorites, removeFromFavorites, duplicateNote, getNoteTitle, moveToTrash, toggleNotePublic } from '@/services/firebase';
import { moveNoteBetweenFolders, movePageToTrash } from '@/store/slices/sidebarSlice';
import { resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId } from "@/components/sidebar/common/constants/constants";
import { useIsPublicNoteStore } from "./isPublicNoteStore";

interface ActionParams {
  noteId: string;
  subNoteId?: string;
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
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}

export const handleMoveToFolder = async ({ noteId, dispatch }: ActionParams) => {
  const newIsPublic = await toggleNotePublic(noteId);
  const noteTitle = await getNoteTitle(noteId);
  useIsPublicNoteStore.getState().setIsPublic(newIsPublic);
  dispatch(moveNoteBetweenFolders({
    noteId: noteId,
    isPublic: newIsPublic,
    title: noteTitle || 'Note'
  }));
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
  toast.success(`Note moved to the ${newIsPublic ? 'Private' : 'Public'} folder`);
}

export const handleMoveToTrash = async ({ noteId, subNoteId, dispatch, router }: ActionParams) => {
  console.log("handleMoveToTrash in actions", noteId, subNoteId);
  if (subNoteId) {
    console.log('subNoteId in handleMoveToTrash', subNoteId);
    await moveToTrash(noteId, subNoteId);
  } else {
    await moveToTrash(noteId);
  }
  const noteTitle = await getNoteTitle(noteId);
  dispatch(movePageToTrash({ noteId, title: noteTitle || 'Note' }));
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
  toast.success('Note moved to trash');
  if (window.location.pathname !== '/dashboard') {
    router.back();
  } else {
    router.refresh();
  }
}

export const handleDuplicateNote = async ({ noteId,  }: ActionParams) => {
  await duplicateNote(noteId);
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
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
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}

export const handleRenameNote = async ({ noteId }: ActionParams) => {
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}

export const handleOpenInNewTab = async ({ noteId }: ActionParams) => {
  const noteUrl = `${window.location.origin}/note/${noteId}`;
  window.open(noteUrl, '_blank');
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}

export const handleOpenInSidePeek = async ({ noteId }: ActionParams) => {
  // const noteUrl = `${window.location.origin}/note/${noteId}`;
  // window.open(noteUrl, '_blank');
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}