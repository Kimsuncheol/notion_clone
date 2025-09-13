'use client';

import React from 'react';
import { Button } from '@mui/material';
import { DraftedNote } from '@/types/firebase';
import { grayColor2, grayColor3, grayColor5, grayColor8 } from '@/constants/color';
import Link from 'next/link';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

interface DraftedNoteItemProps {
  note: DraftedNote;
  onDelete: (id: string) => void;
  lastItem: boolean;
}

export default function DraftedNoteItem({ note, onDelete, lastItem }: DraftedNoteItemProps) {
  const { setShowDeleteConfirmation, setDeleteNoteId } = useMarkdownStore();

  // Format the date to Korean and Western format
  const formatDate = (date: Date) => {
    // Korean date format (2025년 7월 18일)
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const koreanDate = `${year}년 ${month}월 ${day}일`;
    
    // Western date format (2025-07-18)
    const westernDate = date.toISOString().split('T')[0];
    
    return `${koreanDate} (${westernDate})`;
  };

  // Truncate content preview
  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Link
      href={`/${note.authorEmail}/note/${note.id}`}
      className={`py-8 ${lastItem ? 'border-b-0' : 'border-b'}`}
      style={{ backgroundColor: grayColor2, borderColor: grayColor8 }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <h3 
            className="text-lg font-semibold mb-2 line-clamp-1"
            style={{ color: grayColor3 }}
          >
            {note.title || 'Untitled'}
          </h3>
          
          {/* Content Preview */}
          <p 
            className="text-sm mb-3 line-clamp-2"
            style={{ color: grayColor5 }}
          >
            {getContentPreview(note.content)}
          </p>
          
          {/* Date */}
          <p 
            className="text-xs"
            style={{ color: grayColor5 }}
          >
            {formatDate(note.createdAt)}
          </p>
        </div>
        
        {/* Delete Button */}
        <div className="ml-4">
          <Button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteNoteId(note.id);
              setShowDeleteConfirmation(true);
              // onDelete(note.id);
            }}
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#666',
              color: grayColor5,
              fontSize: '12px',
              minWidth: '60px',
              height: '32px',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                borderColor: '#dc2626',
                color: '#dc2626',
              },
              textTransform: 'none',
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </Link>
  );
}
