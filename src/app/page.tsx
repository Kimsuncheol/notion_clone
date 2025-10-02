'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (currentUser?.email) {
      router.replace(`/${currentUser.email}/trending/week`);
    } else {
      router.replace('/trending/week');
    }
  }, [currentUser, loading, router]);

  return null;
}
