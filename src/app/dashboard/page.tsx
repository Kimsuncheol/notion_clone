'use client';
import React, { useState, useEffect, useRef } from 'react';
import { fetchPublicNotes, PublicNote, addNotePage } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { TextField, Box, Typography, Card, CardContent, Container, IconButton, Skeleton } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSidebarData, getFolderByType } from '@/store/slices/sidebarSlice';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Sidebar, { SidebarHandle } from '@/components/Sidebar';

import Inbox from '@/components/Inbox';
import { useModalStore } from '@/store/modalStore';

export default function InitialPage() {
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [askText, setAskText] = useState('');
  const [selectedPageId, setSelectedPageId] = useState<string>('initial');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { showInbox, setShowInbox, setUnreadNotificationCount } = useModalStore();
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { folders } = useAppSelector((state) => state.sidebar);
  const sidebarRef = useRef<SidebarHandle>(null);

  // Load public notes and sidebar data on component mount
  useEffect(() => {
    loadPublicNotes();
    if (auth.currentUser) {
      dispatch(loadSidebarData());
    }
  }, [auth.currentUser, dispatch]);

  // Handle keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadPublicNotes = async () => {
    setIsLoading(true);
    try {
      const notes = await fetchPublicNotes(5);
      setPublicNotes(notes);
    } catch (error) {
      console.error('Error loading public notes:', error);
      toast.error('Failed to load public notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

  const handleCreateNewNote = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create notes');
      return;
    }

    try {
      // Find the private folder using utility function
      const privateFolder = getFolderByType(folders, 'private');
      if (!privateFolder) {
        toast.error('Private folder not found');
        return;
      }

      const pageId = await addNotePage(privateFolder.id, askText || 'Untitled');
      toast.success('New note created');
      router.push(`/note/${pageId}`);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    router.push(`/note/${pageId}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
      {auth.currentUser && sidebarVisible && (
        <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
      )}
      {auth.currentUser && showInbox && (
        <Inbox
          open={showInbox}
          onClose={() => setShowInbox(false)}
          onNotificationCountChange={setUnreadNotificationCount}
        />
      )}
      <div className="flex-1 flex flex-col">
        {/* <Header 
          onFavoriteToggle={() => sidebarRef.current?.refreshFavorites()}
        /> */}

        <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
          {/* Ask Text Field Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              What would you like to create today?
            </Typography>
            <Box sx={{ position: 'relative', maxWidth: '100%', mx: 'auto' }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Ask or describe what you want to create..."
                value={askText}
                onChange={(e) => setAskText(e.target.value)}
                multiline
                rows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#4a5568',
                    color: 'white',
                    border: 'none',
                    fontSize: '1.1rem',
                    paddingRight: '60px',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover fieldset': {
                      border: 'none',
                    },
                    '&.Mui-focused fieldset': {
                      border: 'none',
                    },
                    '& input::placeholder': {
                      color: '#a0aec0',
                      opacity: 1,
                    },
                    '& textarea::placeholder': {
                      color: '#a0aec0',
                      opacity: 1,
                    },
                  },
                }}
              />
              <IconButton
                onClick={handleCreateNewNote}
                disabled={!auth.currentUser}
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  borderRadius: '50%',
                  p: 1,
                  fontSize: '12px',
                  color: 'white',
                  backgroundColor: 'skyblue',
                  '&:hover': {
                    backgroundColor: 'blue',
                  },
                  '&:disabled': {
                    backgroundColor: '#ccc',
                    color: '#666',
                  },
                  width: 40,
                  height: 40,
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: '16px' }} />
              </IconButton>
            </Box>
            {!auth.currentUser && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Please sign in to create notes
              </Typography>
            )}
          </Box>

          {/* Public Notes Section */}
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
                  {publicNotes.map((note,idx) => (
                    <Box key={note.id} sx={{ px: publicNotes.length >= 5 ? 1 : 0 }}>
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
                          // mx: publicNotes.length >= 5 ? 'auto' : '0',
                          mx: idx === 0 || idx === publicNotes.length - 1 ? 0 : 5,    // Don't touch this
                        }}
                        onClick={() => handleNoteClick(note.id)}
                      >
                        <CardContent sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', p: 1.5 }}>
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
        </Container>
  
      </div>
    </div>
  );
} 