'use client';

import React from 'react';
import { Button } from '@mui/material';
import { SavedNote } from '@/types/firebase';
import { grayColor2, grayColor3, grayColor5 } from '@/constants/color';

interface DraftedNoteItemProps {
  note: SavedNote;
  onDelete: (id: string) => void;
  onClick?: (note: SavedNote) => void;
}

export default function DraftedNoteItem({ note, onDelete, onClick }: DraftedNoteItemProps) {
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
    <div 
      className="p-4 rounded-lg mb-4 cursor-pointer transition-all duration-200 hover:bg-opacity-80"
      style={{ backgroundColor: grayColor2 }}
      onClick={() => onClick?.(note)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Title */}
          <h3 
            className="text-lg font-semibold mb-2 line-clamp-1"
            style={{ color: grayColor3 }}
          >
            {note.title || '제목 없음'}
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
            {formatDate(note.savedAt)}
          </p>
        </div>
        
        {/* Delete Button */}
        <div className="ml-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
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
            }}
          >
            삭제
          </Button>
        </div>
      </div>
    </div>
  );
}
