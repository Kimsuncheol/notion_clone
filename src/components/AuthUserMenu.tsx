'use client';
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

/**
 * Example component demonstrating how to use AuthContext
 * This can be used in headers, sidebars, or anywhere user info/logout is needed
 */
export const AuthUserMenu: React.FC = () => {
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Don't render if not authenticated
  if (!isAuthenticated || !currentUser) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {currentUser.email?.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {currentUser.displayName || 'User'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentUser.email}
          </span>
        </div>
      </div>
      
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="ml-auto px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoggingOut ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  );
};

export default AuthUserMenu;
