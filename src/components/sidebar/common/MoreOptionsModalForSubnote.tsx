"use client";

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { handleMoveToTrash, handleCopySubNoteLink, handleDuplicateSubNote } from '@/store/actions';
import { IconButton } from '@mui/material';
import { grayColor2, grayColor3, redColor1 } from '@/constants/color';
import { fontSize, fontSizeMedium, fontSizeSmall } from '@/constants/size';

interface MoreOptionsModalForSubnoteProps {
  parentId: string;
  subNoteId: string;
  onClose: () => void;
}

export default function MoreOptionsModalForSubnote({ parentId, subNoteId, onClose }: MoreOptionsModalForSubnoteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  // If users click outside the modal, close the modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (target && !target.closest('#more-options-modal-for-subnote')) {
        onClose();
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const iconStyle = {
    fontSize: fontSize,
    color: grayColor3,
  };

  const iconButtonStyle = {
    borderRadius: '0px',
    fontSize: fontSizeSmall,
    color: grayColor3,
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '4px',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  };

  const onCopyLink = async () => {
    if (!parentId || !subNoteId) return;
    await handleCopySubNoteLink({ noteId: parentId, subNoteId, isPublic: false, isInFavorites: false, dispatch, router });
    onClose();
  };

  const onDuplicateSubNote = async () => {
    if (!parentId || !subNoteId) return;
    await handleDuplicateSubNote({ noteId: parentId, subNoteId, isPublic: false, isInFavorites: false, dispatch, router });
    onClose();
  };

  const onMoveToTrash = async () => {
    if (!parentId || !subNoteId) return;
    await handleMoveToTrash({ noteId: parentId, subNoteId, isPublic: false, isInFavorites: false, dispatch, router });
    onClose();
  };

  return (
    <div id="more-options-modal-for-subnote" className="absolute top-15 right-4 mt-1 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg py-2 z-[10000] flex flex-col gap-1 items-baseline" style={{ backgroundColor: grayColor2 }}>
      <IconButton
        onMouseEnter={() => setHoveredItemId('copy-sub-note-link')}
        onMouseLeave={() => setHoveredItemId(null)}
        onClick={onCopyLink}
        id="copy-sub-note-link"
        sx={{
          ...iconButtonStyle,
        }}
        disabled={!parentId || !subNoteId}
        title="Copy sub-note link"
      >
        <LinkIcon style={iconStyle} />
        <span>Copy sub-note link</span>
      </IconButton>

      <IconButton
        onMouseEnter={() => setHoveredItemId('duplicate-sub-note')}
        onMouseLeave={() => setHoveredItemId(null)}
        id="duplicate-sub-note"
        onClick={onDuplicateSubNote}
        sx={{
          ...iconButtonStyle,
        }}
        disabled={!parentId || !subNoteId}
        title="Duplicate sub-note"
      >
        <ContentCopyIcon style={iconStyle} />
        <span>Duplicate sub-note</span>
      </IconButton>

      <IconButton
        onMouseEnter={() => setHoveredItemId('move-to-trash')}
        onMouseLeave={() => setHoveredItemId(null)}
        id="move-to-trash"
        onClick={onMoveToTrash}
        sx={{
          ...iconButtonStyle,
          ...(hoveredItemId === 'move-to-trash' && {
            color: redColor1,
          }),
          gap: '2px',
        }}
        title="Move sub-note to trash"
        disabled={!parentId || !subNoteId}
      >
        <DeleteOutlineIcon sx={{ ...iconStyle, fontSize: fontSizeMedium, ...(hoveredItemId === 'move-to-trash' && { color: redColor1 }) }} />
        <span>Move to trash</span>
      </IconButton>
    </div>
  );
}

