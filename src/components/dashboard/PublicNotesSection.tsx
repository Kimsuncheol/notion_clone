'use client';
import React from 'react';
import { PublicNote } from '@/services/firebase';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useMemo } from 'react';

interface PublicNotesSectionProps {
  publicNotes: PublicNote[];
  isLoading: boolean;
  onNoteClick: (noteId: string) => void;
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

const PublicNotesSection: React.FC<PublicNotesSectionProps> = ({
  publicNotes,
  isLoading,
  onNoteClick,
}) => {
  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Recent Public Notes
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ '& .slick-dots': { bottom: '-50px' }, '& .slick-prev, & .slick-next': { zIndex: 1 } }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ px: 1 }}>
                <Skeleton
                  variant="rectangular"
                  width={140}
                  height={140}
                  sx={{ borderRadius: 2, backgroundColor: '#4a5568' }}
                />
              </Box>
            ))}
          </div>
        </Box>
      ) : publicNotes.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No public notes available yet.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Be the first to share a note publicly!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ '& .slick-dots': { bottom: '-50px' }, '& .slick-prev, & .slick-next': { zIndex: 1 } }}>
          <Slider
            dots={publicNotes.length > 1}
            infinite={publicNotes.length >= 5}
            speed={500}
            slidesToShow={Math.min(publicNotes.length, 5)}
            slidesToScroll={1}
            arrows={publicNotes.length >= 5}
            variableWidth={true}
            responsive={[
              {
                breakpoint: 1200,
                settings: {
                  slidesToShow: Math.min(publicNotes.length, 4),
                  slidesToScroll: 1,
                  arrows: publicNotes.length > Math.min(publicNotes.length, 4),
                }
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: Math.min(publicNotes.length, 3),
                  slidesToScroll: 1,
                  arrows: publicNotes.length > Math.min(publicNotes.length, 3),
                }
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: Math.min(publicNotes.length, 2),
                  slidesToScroll: 1,
                  arrows: publicNotes.length > Math.min(publicNotes.length, 2),
                }
              },
              {
                breakpoint: 480,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  arrows: publicNotes.length > 1,
                }
              }
            ]}
          >
            {publicNotes.map((note, index) => (
              // Don't change the marginLeft and marginRight, it's important for the carousel to work
              <Box key={note.id} sx={{ marginLeft: index === 0 ? 0: 2, marginRight: index === publicNotes.length - 1 ? 0: 2 }}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    width: 140,
                    height: 140,
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#4a5568',
                    color: 'white',
                    '&:hover': {
                      boxShadow: 6,
                      backgroundColor: '#2d3748',
                    },
                  }}
                  onClick={() => onNoteClick(note.id)}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', lineHeight: 1.2 }}>
                      {note.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        color: '#e2e8f0',
                        fontSize: '0.7rem',
                        lineHeight: 1.2,
                      }}
                    >
                      {note.preview}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#a0aec0', fontSize: '0.6rem' }}>
                        By {note.authorName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#a0aec0', fontSize: '0.6rem', display: 'block' }}>
                        {formatDate(note.updatedAt)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Slider>
        </Box>
      )}
    </Box>
  );
};

export default PublicNotesSection; 