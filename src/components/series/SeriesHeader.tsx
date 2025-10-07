'use client';

import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { mintColor1 } from '@/constants/color';
import { deleteNotesFromSeries } from '@/services/series/firebase';
import { useRouter } from 'next/navigation';

interface SeriesHeaderProps {
  title: string;
  seriesId: string;
  userEmail?: string;
  showDeletionButtons: boolean;
  selectedNoteIds: Set<string>;
  totalNotesCount: number;
  onDeleteComplete: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const SeriesHeader: React.FC<SeriesHeaderProps> = ({
  title,
  seriesId,
  userEmail,
  showDeletionButtons,
  selectedNoteIds,
  totalNotesCount,
  onDeleteComplete,
  onSelectAll,
  onDeselectAll,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!userEmail || selectedNoteIds.size === 0) return;

    setIsDeleting(true);
    try {
      await deleteNotesFromSeries(userEmail, seriesId, Array.from(selectedNoteIds));
      onDeleteComplete();
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error('Failed to delete notes:', error);
      alert('Failed to delete notes. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const allSelected = selectedNoteIds.size === totalNotesCount && totalNotesCount > 0;

  return (
    <Box sx={{ paddingTop: '40px', paddingBottom: '20px' }}>
      <Typography
        variant="h6"
        sx={{
          color: mintColor1,
          fontWeight: 'bold',
          marginBottom: '16px',
          fontSize: '16px',
        }}
      >
        Series
      </Typography>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 'bold',
          marginBottom: '16px',
          fontSize: '2.5rem',
          lineHeight: '1.2',
        }}
      >
        {title}
      </Typography>
      {showDeletionButtons && (
        <Box sx={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <Button
            variant="outlined"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            sx={{
              borderColor: mintColor1,
              color: mintColor1,
              '&:hover': {
                borderColor: mintColor1,
                backgroundColor: 'rgba(94, 234, 212, 0.1)',
              },
            }}
          >
            {allSelected ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            variant="contained"
            disabled={selectedNoteIds.size === 0 || isDeleting}
            onClick={handleDelete}
            sx={{
              backgroundColor: '#ff6b6b',
              color: 'white',
              '&:hover': {
                backgroundColor: '#ff5252',
              },
              '&:disabled': {
                backgroundColor: '#404040',
                color: '#888888',
              },
            }}
          >
            {isDeleting ? 'Deleting...' : `Delete ${selectedNoteIds.size} note(s)`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SeriesHeader;
