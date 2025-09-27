'use client';

import Link from 'next/link';
import { Box, Card, CardMedia, Divider, Typography } from '@mui/material';
import { mintColor1 } from '@/constants/color';
import { SeriesSubNote } from '@/types/firebase';
import Image from 'next/image';

interface SeriesPostItemProps {
  note: SeriesSubNote;
  index: number;
  isLast: boolean;
  formatDate: (date?: Date) => string;
}

const SeriesPostItem: React.FC<SeriesPostItemProps> = ({ note, index, isLast, formatDate }) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          color: 'white',
          minWidth: '20px',
          marginBottom: '16px',
        }}
      >
        {index + 1}.
      </Typography>
      <Link href={`/note/${note.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 'bold',
            marginBottom: '8px',
            fontSize: '1.25rem',
            cursor: 'pointer',
            '&:hover': {
              color: mintColor1,
            },
          }}
        >
          {note.title}
        </Typography>
      </Link>
    </Box>

    <Box sx={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <Box sx={{ width: '120px', height: '80px', flexShrink: 0 }}>
          <Card
            sx={{
              width: '100%',
              height: '100%',
              backgroundColor: '#2a2a2a',
              border: '1px solid #404040',
            }}
          >
            <CardMedia
              component="div"
              sx={{
                height: '100%',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
              }}
            >
              {note.thumbnailUrl ? (
                <Image src={note.thumbnailUrl ?? ''} alt={note.title ?? ''} width={30} height={30} />
              ) : (
                // show a square with Box component
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: '#404040',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ color: '#9ca3af', fontSize: '0.875rem' }}>No thumbnail</Typography>
                </Box>
              )}
            </CardMedia>
          </Card>
        </Box>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography
          variant="body2"
          sx={{
            color: '#b0b0b0',
            lineHeight: '1.6',
            marginBottom: '12px',
          }}
        >
          {note.content?.slice(0, 100)}...
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: '#888888',
            fontSize: '0.875rem',
          }}
        >
          {formatDate(note.createdAt)}
        </Typography>
      </Box>
    </Box>

    {!isLast && (
      <Divider
        sx={{
          marginTop: '40px',
          backgroundColor: '#404040',
        }}
      />
    )}
  </Box>
);

export default SeriesPostItem;
