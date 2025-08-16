'use client';
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function DashboardPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  // Redirect to signin if not authenticated
  React.useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/signin');
    }
  }, [currentUser, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[color:var(--background)]">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!currentUser) {
    return null;
  }

  return <DashboardLayout user={currentUser} />;
} 