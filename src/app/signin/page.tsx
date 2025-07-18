'use client';
import React, { useState, useEffect } from 'react';
import { firebaseApp } from '@/constants/firebase';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { createOrGetUser } from '@/services/firebase';
import { useModalStore } from '@/store/modalStore';

export default function SignInPage() {
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const { setIsBeginner, setShowManual, manualDismissedForSession } = useModalStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // Check if user is completing sign-in from email link
  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem('emailForSignIn');
        
        if (!emailForSignIn) {
          // User opened the link on a different device. Ask for email.
          emailForSignIn = window.prompt('Please provide your email for confirmation');
        }

        if (emailForSignIn) {
          try {
            await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem('emailForSignIn');
            
            // Check if user is a beginner and update store
            const userData = await createOrGetUser();
            if (userData) {
              setIsBeginner(userData.isBeginner);
              if (userData.isBeginner && !manualDismissedForSession) {
                setShowManual(true);
              }
            }
            
            toast.success('Successfully signed in!');
            router.push('/dashboard');
          } catch (error) {
            console.error('Error signing in with email link:', error);
            toast.error('Failed to sign in. Please try again.');
          }
        }
      }
    };

    completeSignIn();
  }, [auth, router, setIsBeginner, setShowManual, manualDismissedForSession]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (isLoading) return;
    
    setIsLoading(true);
    
    const actionCodeSettings = {
      // URL where the user will be redirected after clicking the email link
      url: window.location.origin + '/signin',
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      
      // Save the email locally so we can use it later
      window.localStorage.setItem('emailForSignIn', email);
      
      setLinkSent(true);
      toast.success('Sign-in link sent to your email!');
    } catch (error) {
      console.error('Error sending email link:', error);
      
      // Handle specific error codes
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address');
      } else if (firebaseError.code === 'auth/missing-email') {
        toast.error('Email address is required');
      } else {
        toast.error('Failed to send sign-in link. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendLink = () => {
    setLinkSent(false);
    handleEmailSignIn({ preventDefault: () => {} } as React.FormEvent);
  };

  if (linkSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] p-4">
        <div className="w-full max-w-md bg-black/5 dark:bg-white/5 p-8 rounded-lg flex flex-col items-center gap-6">
          <div className="text-center">
            <div className="text-6xl mb-4">📧</div>
            <h1 className="text-2xl font-semibold mb-2">Check your email</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We sent a sign-in link to:
            </p>
            <p className="font-medium text-blue-600 dark:text-blue-400 mb-6">
              {email}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Click the link in your email to sign in. The link will expire in 1 hour.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleResendLink}
              disabled={isLoading}
              className="w-full px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Resend link'}
            </button>
            
            <button
              onClick={() => {
                setLinkSent(false);
                setEmail('');
              }}
              className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Use different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] p-4">
      <div className="w-full max-w-md bg-black/5 dark:bg-white/5 p-8 rounded-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Enter your email to get a sign-in link
          </p>
        </div>

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending link...
              </div>
            ) : (
              'Send sign-in link'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
} 