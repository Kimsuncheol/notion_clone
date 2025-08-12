"use client";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import React from 'react'
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { handleCopyLink, handleDuplicateNote, handleMoveToTrash } from '@/store/actions';


export default function MoreoptionsModal({ noteId, setShowMoreOptions }: { noteId: string, setShowMoreOptions: (show: boolean) => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Wrap shared handlers to close the modal after success
  const onCopyLink = async () => {
    if (!noteId) return;
    await handleCopyLink({ noteId, isPublic: false, isInFavorites: false, dispatch, router });
    setShowMoreOptions(false);
  };

  const onDuplicateNote = async () => {
    if (!noteId) return;
    await handleDuplicateNote({ noteId, isPublic: false, isInFavorites: false, dispatch, router });
    setShowMoreOptions(false);
  };

  const onMoveToTrash = async () => {
    if (!noteId) return;
    await handleMoveToTrash({ noteId, isPublic: false, isInFavorites: false, dispatch, router });
    setShowMoreOptions(false);
  };

  return (
    <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg py-2 min-w-48 z-50">
      <button
        onClick={onCopyLink}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-3"
      >
        <LinkIcon fontSize="small" />
        <span>Copy note link</span>
      </button>

      <button
        onClick={onDuplicateNote}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-3"
      >
        <ContentCopyIcon fontSize="small" />
        <span>Duplicate note</span>
      </button>

      <button
        onClick={onMoveToTrash}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-red-600 flex items-center gap-3"
        title="Move to trash"
      >
        <DeleteOutlineIcon fontSize="small" />
        <span>Move to trash</span>
      </button>
    </div>
  )
}
