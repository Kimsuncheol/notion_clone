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

const SeriesDetailView: React.FC<SeriesDetailViewProps> = ({ series }) => {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSortToggle = useCallback(() => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
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
      <SeriesHeader title={series.title} />

      <Box sx={{ display: 'flex', gap: '60px', position: 'relative' }}>
        <SeriesPostList subNotes={series.subNotes} sortOrder={sortOrder} />
        <SeriesSidebar sortOrder={sortOrder} onSortToggle={handleSortToggle} />
      </Box>
    </Box>
  );
};

export default SeriesDetailView;
