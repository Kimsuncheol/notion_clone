'use client';

import React from 'react';
import { Button } from '@mui/material';
import { DraftedNote } from '@/types/firebase';
import { grayColor2, grayColor3, grayColor5 } from '@/constants/color';
import Link from 'next/link';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';

interface DraftedNoteItemProps {
  note: DraftedNote;
  onDelete: (id: string) => void;
}

export default function DraftedNoteItem({ note, onDelete }: DraftedNoteItemProps) {
  const { setShowDeleteConfirmation, setDeleteNoteId } = useMarkdownEditorContentStore();

  // Format the date to Korean format
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1일 전';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      // Format as Korean date (2025년 7월 18일)
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}년 ${month}월 ${day}일`;
    }
  };

  // Truncate content preview
  const getContentPreview = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Link
      href={`/note/${note.id}`}
      className="p-4 mb-4 transition-all duration-200"
      style={{ backgroundColor: grayColor2 }}
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
