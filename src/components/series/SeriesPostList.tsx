'use client';

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { SeriesSubNote } from '@/types/firebase';
import SeriesPostItem from './SeriesPostItem';

interface SeriesPostListProps {
  subNotes?: SeriesSubNote[];
  sortOrder: 'asc' | 'desc';
  showDeletionButtons: boolean;
  selectedNoteIds: Set<string>;
  onNoteSelectionToggle: (noteId: string) => void;
}

const SeriesPostList: React.FC<SeriesPostListProps> = ({
  subNotes,
  sortOrder,
  showDeletionButtons,
  selectedNoteIds,
  onNoteSelectionToggle,
}) => {
  const sortedNotes = useMemo(() => {
    const notes = Array.isArray(subNotes) ? [...subNotes] : [];

    return notes.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (sortOrder === 'asc') {
        return aDate - bDate;
      }

      return bDate - aDate;
    });
  }, [subNotes, sortOrder]);

  const formatDate = (date?: Date) => {
    const safeDate = date ? new Date(date) : new Date();
    return safeDate.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {sortedNotes.map((note, index) => (
          <SeriesPostItem
            key={note.id}
            note={note}
            index={index}
            isLast={index === sortedNotes.length - 1}
            formatDate={formatDate}
            showDeletionButtons={showDeletionButtons}
            isSelected={selectedNoteIds.has(note.id)}
            onSelectionToggle={() => onNoteSelectionToggle(note.id)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default SeriesPostList;
