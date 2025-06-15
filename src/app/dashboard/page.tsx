'use client';
import React, { useState, useEffect, useRef } from 'react';
import { fetchPublicNotes, PublicNote, addNotePage } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { TextField, Box, Typography, Card, CardContent, Container, IconButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Sidebar, { SidebarHandle } from '@/components/Sidebar';
import Header from '@/components/Header';
import ManualModal from '@/components/ManualModal';

// Create a theme that matches the app's design
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#3b82f6',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'inherit',
  },
});

export default function InitialPage() {
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [askText, setAskText] = useState('');
  const [selectedPageId, setSelectedPageId] = useState<string>('initial');
  const [showManual, setShowManual] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
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
      // Find the private folder
      const privateFolder = folders.find(f => f.folderType === 'private');
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
        {auth.currentUser && sidebarVisible && (
          <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
        )}
        <div className="flex-1 flex flex-col">
          <Header onOpenManual={() => setShowManual(true)} />

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
                <Link
                  href="/open-notes"
                  className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  View More →
                </Link>
              </Box>

              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
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
                    dots={true}
                    infinite={true}
                    speed={500}
                    slidesToShow={5}
                    slidesToScroll={1}
                    responsive={[
                      {
                        breakpoint: 1200,
                        settings: {
                          slidesToShow: 4,
                          slidesToScroll: 1,
                        }
                      },
                      {
                        breakpoint: 1024,
                        settings: {
                          slidesToShow: 3,
                          slidesToScroll: 1,
                        }
                      },
                      {
                        breakpoint: 768,
                        settings: {
                          slidesToShow: 2,
                          slidesToScroll: 1,
                        }
                      },
                      {
                        breakpoint: 480,
                        settings: {
                          slidesToShow: 1,
                          slidesToScroll: 1,
                        }
                      }
                    ]}
                  >
                    {publicNotes.map((note) => (
                      <Box key={note.id} sx={{ px: 1 }}>
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
                            mx: 'auto',
                          }}
                          onClick={() => handleNoteClick(note.id)}
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
          </Container>
          <ManualModal open={showManual} onClose={() => setShowManual(false)} />
        </div>
      </div>
    </ThemeProvider>
  );
} 