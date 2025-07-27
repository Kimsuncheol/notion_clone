'use client';
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true);
  const auth = getAuth(firebaseApp);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setIsLoading(false);
      
      if (!user) {
        router.push('/signin');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return <DashboardLayout user={user} />;
} 