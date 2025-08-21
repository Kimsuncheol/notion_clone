'use client'
import React, { useEffect } from 'react';
import { 
  bgColor, 
  generalTextColor, 
} from '@/constants/color';
import InboxPageTabbar from '@/components/inbox/InboxPageTabbar';
import InboxPageMain from '@/components/inbox/InboxPageMain';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';

export default function InboxPage() {
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    // Check authentication status
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div style={{ backgroundColor: bgColor, minHeight: '100vh', color: generalTextColor }}>
      <div className="max-w-4xl px-4 py-8 mx-auto">
        <InboxPageTabbar />
        <InboxPageMain />
      </div>
    </div>
  );
}