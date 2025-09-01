'use client';

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardMedia,
  Divider
} from '@mui/material';
import { MyPostSeries } from '@/types/firebase';
import { mintColor1 } from '@/constants/color';
import Link from 'next/link';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface SeriesDetailViewProps {
  series: MyPostSeries;
  userEmail?: string; // Optional, reserved for future use
}

export default function SeriesDetailView({ series }: SeriesDetailViewProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Ensure subNotes is an array before sorting
  const subNotesArray = Array.isArray(series.subNotes) ? series.subNotes : [];
  const sortedSubNotes = [...subNotesArray].sort((a, b) => {
    if (sortOrder === 'asc') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });



  return (
    <Box sx={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '0 20px',
      minHeight: '100vh',
      color: 'white'
    }}>
      {/* Header */}
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
            lineHeight: '1.2'
          }}
        >
          {series.title}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', gap: '60px', position: 'relative' }}>
        {/* Posts List */}
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {sortedSubNotes.map((post, index) => (
              <Box key={post.id}>
                <Box sx={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                  {/* Post Number and Thumbnail */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        minWidth: '20px'
                      }}
                    >
                      {index + 1}.
                    </Typography>
                    
                    {/* Thumbnail */}
                    <Box sx={{ width: '120px', height: '80px', flexShrink: 0 }}>
                      <Card sx={{ 
                        width: '100%', 
                        height: '100%',
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #404040'
                      }}>
                        <CardMedia
                          component="div"
                          sx={{
                            height: '100%',
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#9ca3af'
                          }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem'
                            }}
                          >
                            🖼️
                          </Box>
                        </CardMedia>
                      </Card>
                    </Box>
                  </Box>

                  {/* Post Content */}
                  <Box sx={{ flex: 1 }}>
                    <Link 
                      href={`/note/${post.id}`} 
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 'bold', 
                          marginBottom: '8px',
                          fontSize: '1.25rem',
                          cursor: 'pointer',
                          '&:hover': {
                            color: mintColor1
                          }
                        }}
                      >
                        {post.title}
                      </Typography>
                    </Link>
                    
                    {/* Content preview - only show if content exists */}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#b0b0b0', 
                        lineHeight: '1.6',
                        marginBottom: '12px'
                      }}
                    >
                      Check the detail of {post.title}
                    </Typography>
                    
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: '#888888',
                        fontSize: '0.875rem'
                      }}
                    >
                      {formatDate(post.createdAt)}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Divider between posts */}
                {index < sortedSubNotes.length - 1 && (
                  <Divider sx={{ 
                    marginTop: '40px', 
                    backgroundColor: '#404040' 
                  }} />
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Sidebar */}
        <Box sx={{ 
          width: '200px', 
          flexShrink: 0,
          position: 'sticky',
          top: '20px',
          height: 'fit-content'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            padding: '20px',
          }}>
            {/* Edit/Delete Options */}
            <Box sx={{ display: 'flex', gap: '8px' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#888888', 
                  cursor: 'pointer',
                  '&:hover': { color: 'white' }
                }}
              >
                Edit
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: '#888888' }}
              >
                |
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#888888', 
                  cursor: 'pointer',
                  '&:hover': { color: '#ff6b6b' }
                }}
              >
                Delete
              </Typography>
            </Box>

            <Divider sx={{ backgroundColor: '#404040' }} />

            {/* Sort Options */}
            <Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  gap: '4px',
                  padding: '4px 0'
                }}
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 
                  <KeyboardArrowUpIcon sx={{ color: mintColor1, fontSize: '18px' }} /> :
                  <KeyboardArrowDownIcon sx={{ color: mintColor1, fontSize: '18px' }} />
                }
                <Typography 
                  variant="body2" 
                  sx={{ color: '#888888' }}
                >
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
