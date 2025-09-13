import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Backdrop,
  Paper
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { blackColor3, grayColor2 } from '@/constants/color';
import SignUpLoadingSpinner from './sign-up/SignUpLoadingSpinner';
import SignUpConfirmation from './sign-up/SignUpConfirmation';
import SignUpLogo from './sign-up/SignUpLogo';
import EmailSignUpForm from './sign-up/EmailSignUpForm';
import SocialSignUpButtons from './sign-up/SocialSignUpButtons';
import SignInPrompt from './sign-up/SignInPrompt';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { isSignInWithEmailLink } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import { fetchSeries } from '@/services/markdown/firebase';

interface SignUpModalProps {
  onClose: () => void;
  onSignIn: () => void;
}

export default function SignUpModal({ onClose, onSignIn }: SignUpModalProps) {
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const { signUpWithEmail, completeEmailSignIn, currentUser, loading } = useAuth();
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

  // Check if user is completing sign-up from email link
  useEffect(() => {
    const completeSignUp = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        try {
          await completeEmailSignIn(email);
          const series = await fetchSeries();
          setSeries(series);
          onClose();
          router.push('/');
        } catch (error) {
          console.error('Error completing sign-up with email link:', error);
          toast.error('Failed to complete sign-up. Please try again.');
        }
      }
    };

    completeSignUp();
  }, [auth, completeEmailSignIn, router, email, setSeries, onClose]);

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      await signUpWithEmail(email);
      setLinkSent(true);
    } catch (error) {
      console.error('Error sending sign-up email link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send sign-up link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = () => {
    setLinkSent(false);
    handleEmailSignUp({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleUseDifferentEmail = () => {
    setLinkSent(false);
    setEmail('');
  };

  // Show loading while auth context is initializing
  if (loading) {
    return <SignUpLoadingSpinner />;
  }

  // Email sent confirmation view
  if (linkSent) {
    return (
      <SignUpConfirmation
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
            minWidth: 600, 
            borderRadius: 4, 
            position: 'relative',
            mx: 2,
            p: 0,
            bgcolor: grayColor2,
            color: 'white',
          }}
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
            <SignUpLogo />
            
            <Box sx={{ width: '70%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <EmailSignUpForm
                email={email}
                isLoading={isLoading}
                onEmailChange={setEmail}
                onSubmit={handleEmailSignUp}
              />
              
              <SocialSignUpButtons />
              
              <SignInPrompt onSignIn={onSignIn} />
            </Box>
          </Box>
        </Paper>
      </Backdrop>
    </>
  );
}