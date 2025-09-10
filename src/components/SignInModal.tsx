import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Backdrop,
  Paper,
  Stack
} from '@mui/material';
import { GitHub, X } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';
import CustomGoogleButton from './CustomGoogleButton';
import { blackColor3, grayColor2, mintColor1, mintColor2 } from '@/constants/color';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { isSignInWithEmailLink } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';
import { fetchSeries } from '@/services/markdown/firebase';

interface SignInModalProps {
  onClose: () => void;
  onSignUp: () => void;
}

export default function SignInModal({ onClose, onSignUp }: SignInModalProps) {
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const { signInWithEmail, completeEmailSignIn, currentUser, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { setSeries } = useMarkdownEditorContentStore();

  // Close modal and redirect if user is already authenticated
  useEffect(() => {
    if (!loading && currentUser) {
      onClose();
      router.push('/');
    }
  }, [currentUser, loading, router, onClose]);

  // Check if user is completing sign-in from email link
  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          await completeEmailSignIn(email);
          const series = await fetchSeries();
          setSeries(series);
          onClose();
          router.push('/');
        } catch (error) {
          console.error('Error signing in with email link:', error);
          toast.error('Failed to sign in. Please try again.');
        }
      }
    };

    completeSignIn();
  }, [auth, completeEmailSignIn, router, email, setSeries, onClose]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      await signInWithEmail(email);
      setLinkSent(true);
    } catch (error) {
      console.error('Error sending email link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send sign-in link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = () => {
    setLinkSent(false);
    handleEmailSignIn({ preventDefault: () => {} } as React.FormEvent);
  };

  // Show loading while auth context is initializing
  if (loading) {
    return (
      <Backdrop open sx={{ zIndex: 1300, backgroundColor: blackColor3 }}>
        <Paper sx={{ p: 4, borderRadius: 4, bgcolor: grayColor2, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </Box>
        </Paper>
      </Backdrop>
    );
  }

  // Email sent confirmation view
  if (linkSent) {
    return (
      <Backdrop open sx={{ zIndex: 1300, backgroundColor: blackColor3 }}>
        <Paper 
          sx={{ 
            minWidth: 600, 
            borderRadius: 4, 
            position: 'relative',
            mx: 2,
            p: 4,
            bgcolor: grayColor2,
            color: 'white',
          }}
        >
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              color: 'white' 
            }}
            onClick={onClose}
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </IconButton>

          <Box sx={{ textAlign: 'center' }}>
            <Box sx={{ fontSize: '60px', mb: 2 }}>📧</Box>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              Check your email
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
              We sent a sign-in link to:
            </Typography>
            <Typography variant="body1" sx={{ color: mintColor1, fontWeight: 500, mb: 3 }}>
              {email}
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 4 }}>
              Click the link in your email to sign in. The link will expire in 1 hour.
            </Typography>
            
            <Stack spacing={2}>
              <Button
                onClick={handleResendLink}
                disabled={isLoading}
                variant="outlined"
                sx={{ 
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: mintColor1,
                    color: mintColor1
                  }
                }}
              >
                {isLoading ? 'Sending...' : 'Resend link'}
              </Button>
              
              <Button
                onClick={() => {
                  setLinkSent(false);
                  setEmail('');
                }}
                sx={{ color: 'rgba(255,255,255,0.7)' }}
              >
                Use different email
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Backdrop>
    );
  }

  return (
    <>
      <Backdrop open sx={{ zIndex: 1300, backgroundColor: blackColor3 }}>
        <Paper 
          sx={{ 
            width: '100%', 
            maxWidth: 600, 
            borderRadius: 4, 
            position: 'relative',
            mx: 2,
            p: 0,
            bgcolor: grayColor2,
            color: 'white',
          }}
          id="sign-in-modal"
        >
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
            }}
            onClick={onClose}
          >
            <CloseIcon sx={{ fontSize: 24, color: 'white' }} />
          </IconButton>

          <Box sx={{ p: 4, display: 'flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
            {/* Logo and welcome text */}
            {/* TODO: change the logo */}
            <Box sx={{ textAlign: 'center', width: '30%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ width: 128, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box 
                      sx={{ 
                        width: 64, 
                        height: 64, 
                        bgcolor: 'primary.main', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                    >
                      <Box 
                        sx={{ 
                          width: 32, 
                          height: 32, 
                          bgcolor: 'background.paper', 
                          borderRadius: '50%' 
                        }} 
                      />
                    </Box>
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        left: -24, 
                        top: 8, 
                        width: 24, 
                        height: 24, 
                        bgcolor: 'pink.400', 
                        borderRadius: '50%' 
                      }} 
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        right: -24, 
                        top: 8, 
                        width: 24, 
                        height: 24, 
                        bgcolor: 'blue.400', 
                        borderRadius: '50%' 
                      }} 
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        left: 8, 
                        top: -16, 
                        width: 16, 
                        height: 16, 
                        bgcolor: 'yellow.400', 
                        borderRadius: '50%' 
                      }} 
                    />
                  </Box>
                </Box>
              </Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                Welcome back!
              </Typography>
            </Box>

            <Stack spacing={3} sx={{ width: '70%' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: 'white' }}>
                  Login
                </Typography>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Login with email
                </Typography>
              </Box>

              <form onSubmit={handleEmailSignIn} style={{ width: '100%' }}>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 0 }}>
                  <TextField
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    fullWidth
                    variant="outlined"
                    required
                    disabled={isLoading}
                    sx={{
                      width: '70%',
                      border: '1px solid #ffffff',
                      '& .MuiOutlinedInput-root': {
                        color: 'white',
                        borderRadius: 0,
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                        }
                      }
                    }}
                  />
                  
                  <Button 
                    type="submit"
                    variant="contained" 
                    fullWidth 
                    size="large"
                    disabled={isLoading || !email.trim()}
                    sx={{ 
                      width: 'fit-content',
                      borderRadius: 0, 
                      boxShadow: 'none',
                      fontSize: '16px',
                      py: '15px',
                      px: '16px',
                      bgcolor: mintColor1,
                      color: 'black',
                      '&:hover': {
                        bgcolor: mintColor2
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(255,255,255,0.3)',
                        color: 'rgba(0,0,0,0.5)'
                      }
                    }}
                  >
                    {isLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </Box>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </Box>
              </form>

              <Stack spacing={2}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Login with social account
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <IconButton 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: 'grey.900', 
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'grey.800'
                      }
                    }}
                  >
                    <GitHub sx={{ fontSize: 20 }} />
                  </IconButton>
                  
                  <IconButton 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: 'background.paper', 
                      border: '1px solid', 
                      borderColor: 'grey.300',
                      color: 'grey.700',
                      '&:hover': {
                        bgcolor: 'grey.50'
                      }
                    }}
                  >
                    <CustomGoogleButton />
                  </IconButton>
                  
                  <IconButton 
                    sx={{ 
                      width: 48, 
                      height: 48, 
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'grey.300',
                      '&:hover': {
                        bgcolor: 'blue.700'
                      }
                    }}
                  >
                    <X sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>
              </Stack>

              <Box sx={{  }}>
                <Typography variant="body2" sx={{ color: 'white' }}>
                  Not a member yet?{' '}
                  <Button 
                    variant="text" 
                    size="small"
                    sx={{ 
                      color: 'primary.main',
                      fontWeight: 500,
                      minWidth: 'auto',
                      p: 0,
                      '&:hover': {
                        color: 'primary.dark',
                        bgcolor: 'transparent'
                      }
                    }}
                    onClick={onSignUp}
                  >
                    Sign up
                  </Button>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Backdrop>
    </>
  );
}

