'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { getAuth, isSignInWithEmailLink } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchSeries } from '@/services/markdown/firebase';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import toast from 'react-hot-toast';

type CompletionStatus = 'pending' | 'success' | 'error';

const auth = getAuth(firebaseApp);

export default function CompleteAuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeEmailSignIn, loading, currentUser } = useAuth();
  const { setSeries } = useMarkdownStore();
  const [status, setStatus] = useState<CompletionStatus>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectPath = useMemo(() => {
    const continueUrl = searchParams?.get('continueUrl');
    if (!continueUrl) {
      return '/';
    }
    if (!continueUrl.startsWith('/')) {
      return '/';
    }
    return continueUrl;
  }, [searchParams]);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (currentUser && status === 'success') {
      router.replace(redirectPath);
    }
  }, [currentUser, loading, router, status, redirectPath]);

  useEffect(() => {
    if (status !== 'pending') {
      return;
    }

    if (!isSignInWithEmailLink(auth, typeof window !== 'undefined' ? window.location.href : '')) {
      setErrorMessage('This sign-in link is invalid or may have expired. Please request a new link.');
      setStatus('error');
      return;
    }

    const completeAuth = async () => {
      try {
        const emailFromQuery = searchParams?.get('email') ?? undefined;
        await completeEmailSignIn(emailFromQuery || undefined);
        try {
          const series = await fetchSeries();
          setSeries(series);
        } catch (seriesError) {
          console.error('Failed to fetch series after sign-in:', seriesError);
        }
        setStatus('success');
        toast.success('You are now signed in!');
        router.replace(redirectPath);
      } catch (error) {
        console.error('Error completing email sign-in:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to complete sign-in. Please request a new link.';
        setErrorMessage(message);
        toast.error(message);
        setStatus('error');
      }
    };

    completeAuth();
  }, [completeEmailSignIn, redirectPath, router, searchParams, setSeries, status]);

  const handleBackToSignIn = () => {
    router.replace('/signin');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: (theme) => theme.palette.background.default,
        px: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 420,
          width: '100%',
          p: 4,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {status === 'pending' && (
          <>
            <CircularProgress sx={{ alignSelf: 'center' }} />
            <Typography variant="h6">Completing your sign-in&hellip;</Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we verify your email link.
            </Typography>
          </>
        )}

        {status === 'success' && (
          <>
            <Typography variant="h6">Sign-in complete!</Typography>
            <Typography variant="body2" color="text.secondary">
              You are being redirected. If nothing happens, click below to continue.
            </Typography>
            <Button variant="contained" color="primary" onClick={() => router.replace(redirectPath)}>
              Continue
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <Typography variant="h6" color="error">
              Sign-in failed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {errorMessage}
            </Typography>
            <Button variant="contained" color="primary" onClick={handleBackToSignIn}>
              Back to sign-in
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}
