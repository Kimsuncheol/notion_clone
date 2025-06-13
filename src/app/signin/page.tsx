'use client';
import React, { useState, useEffect } from 'react';
import { firebaseApp } from '@/constants/firebase';
import { getAuth, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const actionCodeSettings = {
  url: typeof window !== 'undefined' ? `${window.location.origin}/signin` : '/signin',
  handleCodeInApp: true,
};

export default function SignInPage() {
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // complete sign-in if returning via email link
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem('emailForSignIn');
      const promptEmail = async () => {
        const em = storedEmail || window.prompt('Please provide your email for confirmation');
        if (!em) return;
        try {
          await signInWithEmailLink(auth, em, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          setMessage('Successfully signed in! Redirecting...');
          setTimeout(() => router.push('/note/initial'), 1500);
        } catch (err) {
          console.error(err);
          setMessage('Sign-in failed');
        }
      };
      promptEmail();
    }
  }, [auth, router]);

  const handleSendLink = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Sign-in link sent! Check your email.');
    } catch (err) {
      console.error(err);
      setMessage('Failed to send link');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] p-4">
      <div className="w-full max-w-md bg-black/5 dark:bg-white/5 p-6 rounded">
        <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full mb-4 px-3 py-2 rounded bg-transparent border border-black/20 dark:border-white/20 focus:outline-none"
        />
        <button
          onClick={handleSendLink}
          className="w-full py-2 bg-black/10 dark:bg-white/10 rounded hover:bg-black/20 dark:hover:bg-white/20"
        >
          Send Sign-In Link
        </button>
        {message && <p className="mt-4 text-sm">{message}</p>}
      </div>
    </div>
  );
} 