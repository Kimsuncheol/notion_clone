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
  const {
    signInWithEmail,
    signInWithGoogle,
    signInWithGithub,
    signInWithTwitter,
    completeEmailSignIn,
    currentUser,
    loading
  } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isTwitterLoading, setIsTwitterLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const { setSeries } = useMarkdownStore();
  const isAnySocialLoading = isGoogleLoading || isGithubLoading || isTwitterLoading;

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

  const handleGoogleSignIn = async () => {
    await handleSocialSignIn(signInWithGoogle, setIsGoogleLoading, 'Google');
  };

  const handleGithubSignIn = async () => {
    await handleSocialSignIn(signInWithGithub, setIsGithubLoading, 'GitHub');
  };

  const handleTwitterSignIn = async () => {
    await handleSocialSignIn(signInWithTwitter, setIsTwitterLoading, 'Twitter');
  };

  const handleSocialSignIn = async (
    action: () => Promise<void>,
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>,
    providerLabel: string
  ) => {
    if (isAnySocialLoading) {
      return;
    }

    setLoadingState(true);

    try {
      await action();
      const series = await fetchSeries();
      setSeries(series);
      onClose();
      router.push('/');
    } catch (error) {
      console.error(`Error during ${providerLabel} sign-in:`, error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to sign in with ${providerLabel}. Please try again.`
      );
    } finally {
      setLoadingState(false);
    }
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
              <SocialSignInButtons
                onGoogleClick={handleGoogleSignIn}
                isGoogleLoading={isGoogleLoading}
                onGithubClick={handleGithubSignIn}
                onTwitterClick={handleTwitterSignIn}
                isGithubLoading={isGithubLoading}
                isTwitterLoading={isTwitterLoading}
              />
              <SignUpPrompt onSignUp={onSignUp} />
            </Box>
          </Box>
        </Paper>
      </Backdrop>
    </>
  );
}
