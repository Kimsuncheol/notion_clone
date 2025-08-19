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
import { createOrGetUser } from '@/services/firebase';
import { useModalStore } from '@/store/modalStore';
import toast from 'react-hot-toast';

// Auth context interface
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
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

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If user just signed in, handle beginner flow
      if (user) {
        try {
          const userData = await createOrGetUser();
          if (userData) {
            setIsBeginner(userData.isBeginner);
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
      url: window.location.origin + '/signin',
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

  // Complete email sign-in (when user clicks the link)
  const completeEmailSignIn = async (email?: string): Promise<void> => {
    console.log('completeEmailSignIn', email);
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = email || window.localStorage.getItem('emailForSignIn');
      
      if (!emailForSignIn) {
        // User opened the link on a different device. Ask for email.
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }

      if (emailForSignIn) {
        try {
          await signInWithEmailLink(auth, emailForSignIn, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          toast.success('Successfully signed in!');
        } catch (error) {
          console.error('Error signing in with email link:', error);
          throw new Error('Failed to sign in. Please try again. in AuthContext');
        }
      } else {
        throw new Error('Email is required to complete sign-in');
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
