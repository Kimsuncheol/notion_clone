import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Backdrop,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { blackColor3, grayColor2 } from '@/constants/color';
import SignInLoadingSpinner from './sign-in/SignInLoadingSpinner';
import EmailSentConfirmation from './sign-in/EmailSentConfirmation';
import SignInLogo from './sign-in/SignInLogo';
import EmailSignInForm from './sign-in/EmailSignInForm';
import SocialSignInButtons from './sign-in/SocialSignInButtons';
import SignUpPrompt from './sign-in/SignUpPrompt';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { isSignInWithEmailLink } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
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
  const { setSeries } = useMarkdownStore();

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

  const handleUseDifferentEmail = () => {
    setLinkSent(false);
    setEmail('');
  };

  // Show loading while auth context is initializing
  if (loading) {
    return <SignInLoadingSpinner />;
  }

  // Email sent confirmation view
  if (linkSent) {
    return (
      <EmailSentConfirmation
        email={email}
        isLoading={isLoading}
        onClose={onClose}
        onResendLink={handleResendLink}
        onUseDifferentEmail={handleUseDifferentEmail}
      />
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
            <SignInLogo />
            
            <Box sx={{ width: '70%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <EmailSignInForm
                email={email}
                isLoading={isLoading}
                onEmailChange={setEmail}
                onSubmit={handleEmailSignIn}
              />
              <SocialSignInButtons />
              <SignUpPrompt onSignUp={onSignUp} />
            </Box>
          </Box>
        </Paper>
      </Backdrop>
    </>
  );
}

