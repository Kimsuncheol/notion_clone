'use client';
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink,
  signOut 
} from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { createOrGetUser } from '@/services/sign-up/firebase';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';
import { fetchUserProfile } from '@/services/my-post/firebase';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';

// Auth context interface
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signUpWithEmail: (email: string) => Promise<void>;
  completeEmailSignIn: (email?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(firebaseApp);
  const { setIsBeginner, setShowManual, manualDismissedForSession } = useModalStore();
  const { setAvatar } = useMarkdownStore();

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If user just signed in, handle beginner flow
      if (user) {
        try {
          const userData = await createOrGetUser();
          if (userData) {
            setIsBeginner(userData.isBeginner as boolean);
            if (userData.isBeginner && !manualDismissedForSession) {
              setShowManual(true);
            }
          }
        } catch (error) {
          console.error('Error creating/getting user data:', error);
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, setIsBeginner, setShowManual, manualDismissedForSession]);

  // Sign in with email link (passwordless authentication)
  const signInWithEmail = async (email: string): Promise<void> => {
    const actionCodeSettings = {
      url: `${window.location.protocol}//${window.location.host}/signin`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email locally so we can use it later
      window.localStorage.setItem('emailForSignIn', email);
      toast.success('Sign-in link sent to your email!');
    } catch (error) {
      console.error('Error sending email link:', error);
      
      // Handle specific error codes
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (firebaseError.code === 'auth/missing-email') {
        throw new Error('Email address is required');
      } else {
        throw new Error('Failed to send sign-in link. Please try again.');
      }
    }
  };

  // Sign up with email link (same as sign-in, Firebase creates account automatically)
  const signUpWithEmail = async (email: string): Promise<void> => {
    const actionCodeSettings = {
      url: `${window.location.protocol}//${window.location.host}/signin`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email locally so we can use it later
      window.localStorage.setItem('emailForSignIn', email);
      toast.success('Welcome! Sign-up link sent to your email!');
    } catch (error) {
      console.error('Error sending sign-up email link:', error);
      
      // Handle specific error codes
      const firebaseError = error as { code?: string };
      if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (firebaseError.code === 'auth/missing-email') {
        throw new Error('Email address is required');
      } else {
        throw new Error('Failed to send sign-up link. Please try again.');
      }
    }
  };

  // Complete email sign-in (when user clicks the link)
  const completeEmailSignIn = async (email?: string): Promise<void> => {
    console.log('completeEmailSignIn called with email:', email);
    console.log('Current URL:', window.location.href);
    // call 'fetchUserProfile' to get the user data
    const userData = await fetchUserProfile(email || '');
    if (userData) {
      // set the avatar to the user data
      setAvatar(userData.avatar || '');
    }
    
    // First verify if this is actually an email sign-in link
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      console.log('Not a valid email sign-in link');
      return;
    }

    let emailForSignIn = email || window.localStorage.getItem('emailForSignIn');
    
    if (!emailForSignIn) {
      // User opened the link on a different device. Ask for email.
      emailForSignIn = window.prompt('Please provide your email for confirmation');
    }

    if (!emailForSignIn) {
      throw new Error('Email is required to complete sign-in');
    }

    try {
      await signInWithEmailLink(auth, emailForSignIn, window.location.href);
      window.localStorage.removeItem('emailForSignIn');
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error('Error signing in with email link:', error);
      
      // Handle specific Firebase auth errors
      const firebaseError = error as { code?: string; message?: string };
      
      if (firebaseError.code === 'auth/invalid-action-code') {
        // Clear any potentially stale URL parameters
        window.history.replaceState(null, '', window.location.pathname);
        throw new Error('This sign-in link is invalid or has expired. Please request a new one.');
      } else if (firebaseError.code === 'auth/expired-action-code') {
        throw new Error('This sign-in link has expired. Please request a new one.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        throw new Error('The email address is invalid. Please check and try again.');
      } else {
        throw new Error('Failed to sign in. Please try requesting a new link.');
      }
    }
  };

  // Sign out
  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      toast.success('Successfully signed out!');
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  };

  // Context value
  const value: AuthContextType = {
    currentUser,
    loading,
    signInWithEmail,
    signUpWithEmail,
    completeEmailSignIn,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
