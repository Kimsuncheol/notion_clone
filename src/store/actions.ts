import { toast } from "react-hot-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AppDispatch } from "./index";
import { addToFavorites, removeFromFavorites, duplicateNote, getNoteTitle, moveToTrash, toggleNotePublic } from '@/services/firebase';
import { moveNoteBetweenFolders, movePageToTrash, SidebarStore, NoteNode } from '@/store/slices/sidebarSlice';
import { resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId } from "@/components/sidebar/common/constants/constants";
import { useIsPublicNoteStore } from "./isPublicNoteStore";
import { useSidebarStore } from "./sidebarStore";

interface ActionParams {
  noteId: string;
  subNoteId?: string;
  isPublic: boolean;
  isInFavorites: boolean;
  dispatch: AppDispatch;
  router: AppRouterInstance;
}

export const handleToggleFavorite = async ({ noteId, subNoteId, isInFavorites }: ActionParams) => {
  if (isInFavorites) {
    if (subNoteId) {
      await removeFromFavorites(noteId, subNoteId);
      toast.success('Sub-note removed from favorites');
    } else {
    await removeFromFavorites(noteId);
    toast.success('Note removed from favorites');
    }
  } else {
    if (subNoteId) {
      await addToFavorites(noteId, subNoteId);
      toast.success('Sub-note added to favorites');
    } else {
      await addToFavorites(noteId);
      toast.success('Note added to favorites');
    }
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
  if (subNoteId) {
    await moveToTrash(noteId, subNoteId);
    toast.success('Sub-note moved to trash');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('subnotes-changed', { detail: { parentIds: [noteId] } }));
    }
    resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
    return;
  }
  const noteTitle = await getNoteTitle(noteId);
  const currentState = SidebarStore.getState();
  const folders = currentState.folders;

  let nextNoteId: string | null = null;

  for (const folder of folders) {
    const noteIndex = folder.notes.findIndex((note: NoteNode) => note.id === noteId);
    if (noteIndex !== -1) {
      if (folder.notes.length > 1) {
        const targetIndex = (noteIndex == 0) ? 1 : 0;
        nextNoteId = folder.notes[targetIndex].id;
      } 
      break;
    }
  }

  await moveToTrash(noteId);
  dispatch(movePageToTrash({noteId, title: noteTitle || 'Note'}))
  toast.success('Note moved to trash');
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();

  if (nextNoteId) {
    router.push(`/note/${nextNoteId}`);
  } else {
    router.push('/dashboard');
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
  useSidebarStore.getState().setSelectedPageIdToEditTitle(noteId);
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}

export const handleOpenInNewTab = async ({ noteId }: ActionParams) => {
  const noteUrl = `${window.location.origin}/note/${noteId}`;
  window.open(noteUrl, '_blank');
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}

export const handleOpenInSidePeek = async () => {
  // const noteUrl = `${window.location.origin}/note/${noteId}`;
  // window.open(noteUrl, '_blank');
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}