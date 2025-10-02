'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SignInModal from '@/components/SignInModal';
import SignUpModal from '@/components/SignUpModal';
import { useAuth } from '@/contexts/AuthContext';

export default function SignInPage() {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace('/trending/week');
    }
  }, [currentUser, loading, router]);

  const closeAndRedirect = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    router.replace('/trending/week');
  };

  const openSignUp = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  const openSignIn = () => {
    setShowSignUp(false);
    setShowSignIn(true);
  };

  return (
    <>
      {showSignIn && (
        <SignInModal
          onClose={closeAndRedirect}
          onSignUp={openSignUp}
        />
      )}
      {showSignUp && (
        <SignUpModal
          onClose={closeAndRedirect}
          onSignIn={openSignIn}
        />
      )}
    </>
  );
}
