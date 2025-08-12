import React, { useEffect, useRef } from 'react'
import LinkIcon from '@mui/icons-material/Link';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import TurnRightRoundedIcon from '@mui/icons-material/TurnRightRounded';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { handleMoveToTrash } from '@/store/actions';
import { modalBgColor } from '@/constants/bgColorConstants';

interface MoreOptionsModalForSubnoteProps {
  parentId: string;
  subNoteId: string;
  onClose: () => void;
}

export default function MoreOptionsModalForSubnote({ parentId, subNoteId, onClose }: MoreOptionsModalForSubnoteProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (event.target instanceof Node && !modalRef.current?.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const onCopyLink = async () => {
    try {
      const url = `${window.location.origin}/note/${parentId}/subnote/${subNoteId}`;
      await navigator.clipboard.writeText(url);
      toast.success('Sub-note link copied to clipboard!');
      onClose();
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const onMoveToTrash = async () => {
    try {
      await handleMoveToTrash({ noteId: parentId, subNoteId, isPublic: false, isInFavorites: false, dispatch, router });
      toast.success('Sub-note moved to trash');
      onClose();
    } catch {
      toast.error('Failed to move sub-note to trash');
    }
  };

  return (
    <div
      className="absolute right-4 top-12 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg py-2 min-w-48 z-[10000]"
      ref={modalRef}
      style={{ backgroundColor: modalBgColor }}
    >
      <button
        onClick={onCopyLink}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-3"
      >
        <LinkIcon fontSize="small" />
        <span>Copy sub-note link</span>
      </button>

      <button
        onClick={onMoveToTrash}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-white hover:text-red-600 flex items-center gap-3"
        title="Move sub-note to trash"
      >
        <DeleteOutlineIcon fontSize="small" />
        <span>Move to trash</span>
      </button>

      <button
        onClick={() => {
          const event = new CustomEvent('open-move-subnote-modal', { detail: { parentId, subNoteId } });
          window.dispatchEvent(event);
          onClose();
        }}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 flex items-center gap-3"
        title="Move to other parent note"
      >
        <TurnRightRoundedIcon fontSize="small" />
        <span>Move to other parent</span>
      </button>
    </div>
  )
}
