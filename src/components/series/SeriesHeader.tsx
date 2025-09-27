'use client';

import { Box, Typography } from '@mui/material';
import { mintColor1 } from '@/constants/color';

interface SeriesHeaderProps {
  title: string;
}

const SeriesHeader: React.FC<SeriesHeaderProps> = ({ title }) => (
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
        marginBottom: '40px',
        fontSize: '2.5rem',
        lineHeight: '1.2',
      }}
    >
      {title}
    </Typography>
  </Box>
);

export default SeriesHeader;
