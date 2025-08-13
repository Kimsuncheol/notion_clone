import { toast } from "react-hot-toast";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { AppDispatch } from "./index";
import { addToFavorites, removeFromFavorites, duplicateNote, getNoteTitle, moveToTrash, toggleNotePublic, fetchSubNotes, fetchSubNotePage, createOrUpdateSubNotePage } from '@/services/firebase';
import { moveNoteBetweenFolders, movePageToTrash, SidebarStore, NoteNode } from '@/store/slices/sidebarSlice';
import { resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId } from "@/components/sidebar/common/constants/constants";
import { useIsPublicNoteStore } from "./isPublicNoteStore";
import { useSidebarStore } from "./sidebarStore";
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';

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

// Sub-note specific actions
export const handleCopySubNoteLink = async ({ noteId, subNoteId }: ActionParams) => {
  if (!noteId || !subNoteId) return;
  const link = `${window.location.origin}/note/${noteId}/subnote/${subNoteId}`;
  try {
    await navigator.clipboard.writeText(link);
    toast.success('Sub-note link copied to clipboard!');
  } catch (error) {
    console.error('Error copying sub-note link:', error);
    toast.error('Failed to copy sub-note link');
  }
  resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
}

export const handleDuplicateSubNote = async ({ noteId, subNoteId, router }: ActionParams) => {
  if (!noteId || !subNoteId) return;
  try {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in');
      return;
    }
    const original = await fetchSubNotePage(noteId, subNoteId);
    const sourceTitle = original?.title || 'Untitled';
    const duplicateTitle = `${sourceTitle} (copy)`;
    const newId = await createOrUpdateSubNotePage(
      noteId,
      { title: duplicateTitle, content: original?.content || '' },
      user.uid,
      user.displayName || user.email?.split('@')[0] || 'Anonymous'
    );
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('subnotes-changed', { detail: { parentIds: [noteId] } }));
    }
    toast.success('Sub-note duplicated');
    if (router) {
      router.push(`/note/${noteId}/subnote/${newId}`);
    }
  } catch (error) {
    console.error('Error duplicating sub-note:', error);
    toast.error('Failed to duplicate sub-note');
  } finally {
    resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
  }
}

export const handleDeleteAllSubNotes = async ({ noteId }: ActionParams) => {
  if (!noteId) return;
  try {
    const subNotes = await fetchSubNotes(noteId);
    if (!subNotes || subNotes.length === 0) {
      toast.success('No sub-notes to move to trash');
      return;
    }
    await Promise.all(subNotes.map(sn => moveToTrash(noteId, sn.id)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('subnotes-changed', { detail: { parentIds: [noteId] } }));
    }
    toast.success('All sub-notes moved to trash');
  } catch (error) {
    console.error('Error moving all sub-notes to trash:', error);
    toast.error('Failed to move all sub-notes to trash');
  } finally {
    resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
  }
}