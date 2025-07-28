'use client';
import React from 'react';
import { PublicNote } from '@/services/firebase';
import { Box, Typography, Card, CardContent, Skeleton, Link } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Image from 'next/image';

interface PublicNotesSectionProps {
  publicNotes: PublicNote[];
  isLoading: boolean;
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
}) => {
  return (
    <Box sx={{ width: '100%', mx: 'auto', zIndex: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Recent Public Notes
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          {[...Array(3)].map((_, idx) => (
            <Card
              key={idx}
              sx={{
                width: 250,
                height: 200,
                backgroundColor: '#4a5568',
                borderRadius: 2,
              }}
            >
              {/* Image thumbnail skeleton */}
              <Skeleton variant="rectangular" animation="wave" height={80} sx={{ bgcolor: '#5a6676' }} />

              {/* Text content skeletons */}
              <CardContent sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Skeleton variant="text" animation="wave" width="80%" height={16} sx={{ bgcolor: '#5a6676' }} />
                <Skeleton variant="text" animation="wave" width="60%" height={12} sx={{ bgcolor: '#5a6676' }} />
                <Skeleton variant="text" animation="wave" width="40%" height={10} sx={{ bgcolor: '#5a6676' }} />
              </CardContent>
            </Card>
          ))}
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
        <Box sx={{ '& .slick-dots': { bottom: '-50px' }, '& .slick-prev, & .slick-next': { zIndex: 0 } }}>
          <Slider
            dots={publicNotes.length > 1}
            infinite={publicNotes.length >= 3}
            speed={500}
            slidesToShow={Math.min(publicNotes.length, 3)}
            slidesToScroll={1}
            arrows={publicNotes.length >= 3}
            variableWidth={true}
            responsive={[
              {
                breakpoint: 1200,
                settings: {
                  slidesToShow: Math.min(publicNotes.length, 3),
                  slidesToScroll: 1,
                  arrows: publicNotes.length > Math.min(publicNotes.length, 3),
                }
              },
              {
                breakpoint: 1024,
                settings: {
                  slidesToShow: Math.min(publicNotes.length, 2),
                  slidesToScroll: 1,
                  arrows: publicNotes.length > Math.min(publicNotes.length, 2),
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
            {publicNotes.map((note) => (
              // Don't change the marginLeft and marginRight, it's important for the carousel to work
                <Box key={note.id} sx={{ marginLeft: 2, marginRight: 2 }} id={note.id}>
                  <Link href={`/note/${note.id}`}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      width: 250,
                      height: 200,
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: '#4a5568',
                      color: 'white',
                      '&:hover': {
                        boxShadow: 6,
                        backgroundColor: '#2d3748',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
                      {/* Thumbnail */}
                      {note.thumbnail && (
                        <Box sx={{ mb: 1.5, borderRadius: 1, overflow: 'hidden', height: 80 }}>
                          <Image
                            width={250}
                            height={200}
                            src={note.thumbnail}
                            alt={note.title}
                          />
                        </Box>
                      )}

                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'white', fontSize: '0.8rem', lineHeight: 1.2 }}>
                        {note.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          flexGrow: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: note.thumbnail ? 1 : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: '#e2e8f0',
                          fontSize: '0.7rem',
                          lineHeight: 1.2,
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {note.publishContent}
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
                </Link>
              </Box>
            ))}
          </Slider>
        </Box>
      )}
    </Box>
  );
};

export default PublicNotesSection; 