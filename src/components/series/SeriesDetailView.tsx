'use client';

import React, { useCallback, useState } from 'react';
import { Box } from '@mui/material';
import { MySeries } from '@/types/firebase';
import SeriesHeader from './SeriesHeader';
import SeriesPostList from './SeriesPostList';
import SeriesSidebar from './SeriesSidebar';

interface SeriesDetailViewProps {
  series: MySeries;
  userEmail?: string; // Reserved for future use
}

const SeriesDetailView: React.FC<SeriesDetailViewProps> = ({ series, userEmail }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showDeletionButtons, setShowDeletionButtons] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

  const handleSortToggle = useCallback(() => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const handleDeleteToggle = useCallback(() => {
    setShowDeletionButtons(prev => !prev);
    setSelectedNoteIds(new Set()); // Clear selections when toggling
  }, []);

  const handleNoteSelectionToggle = useCallback((noteId: string) => {
    setSelectedNoteIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!series.subNotes) return;
    const allNoteIds = series.subNotes.map(note => note.id);
    setSelectedNoteIds(new Set(allNoteIds));
  }, [series.subNotes]);

  const handleDeselectAll = useCallback(() => {
    setSelectedNoteIds(new Set());
  }, []);

  return (
    <Box
      sx={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        minHeight: '100vh',
        color: 'white',
      }}
    >
      <SeriesHeader
        title={series.title}
        seriesId={series.id}
        userEmail={userEmail}
        showDeletionButtons={showDeletionButtons}
        selectedNoteIds={selectedNoteIds}
        totalNotesCount={series.subNotes?.length || 0}
        onDeleteComplete={() => {
          setShowDeletionButtons(false);
          setSelectedNoteIds(new Set());
        }}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
      />

      <Box sx={{ display: 'flex', gap: '60px', position: 'relative' }}>
        <SeriesPostList
          subNotes={series.subNotes}
          sortOrder={sortOrder}
          showDeletionButtons={showDeletionButtons}
          selectedNoteIds={selectedNoteIds}
          onNoteSelectionToggle={handleNoteSelectionToggle}
        />
        <SeriesSidebar
          sortOrder={sortOrder}
          onSortToggle={handleSortToggle}
          showDeletionButtons={showDeletionButtons}
          onDeleteToggle={handleDeleteToggle}
        />
      </Box>
    </Box>
  );
};

export default SeriesDetailView;
