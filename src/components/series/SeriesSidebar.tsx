'use client';

import { Box, Divider, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { mintColor1 } from '@/constants/color';

interface SeriesSidebarProps {
  sortOrder: 'asc' | 'desc';
  onSortToggle: () => void;
  showDeletionButtons: boolean;
  onDeleteToggle: () => void;
}

const SeriesSidebar: React.FC<SeriesSidebarProps> = ({ sortOrder, onSortToggle, showDeletionButtons, onDeleteToggle }) => (
  <Box
    sx={{
      width: '200px',
      flexShrink: 0,
      position: 'sticky',
      top: '20px',
      height: 'fit-content',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '20px',
      }}
    >
      <Box sx={{ display: 'flex', gap: '8px' }}>
        <Typography
          variant="body2"
          sx={{
            color: '#888888',
            cursor: 'pointer',
            '&:hover': { color: 'white' },
          }}
        >
          Edit
        </Typography>
        <Typography variant="body2" sx={{ color: '#888888' }}>
          |
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: showDeletionButtons ? '#ff6b6b' : '#888888',
            cursor: 'pointer',
            '&:hover': { color: '#ff6b6b' },
          }}
          onClick={onDeleteToggle}
        >
          Delete
        </Typography>
      </Box>

      <Divider sx={{ backgroundColor: '#404040' }} />

      <Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            gap: '4px',
            padding: '4px 0',
          }}
          onClick={onSortToggle}
        >
          {sortOrder === 'asc' ? (
            <KeyboardArrowUpIcon sx={{ color: mintColor1, fontSize: '18px' }} />
          ) : (
            <KeyboardArrowDownIcon sx={{ color: mintColor1, fontSize: '18px' }} />
          )}
          <Typography variant="body2" sx={{ color: '#888888' }}>
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Box>
);

export default SeriesSidebar;
