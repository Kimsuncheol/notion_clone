'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import AISessionConversation from '@/components/ai/AISessionConversation';
import { useAuth } from '@/contexts/AuthContext';

export default function AISessionPage({ params }: { params: { userId: string; session_id: string } }) {
  const router = useRouter();
  const { currentUser, loading } = useAuth();

  const userId = params.userId ?? '';
  const sessionId = params.session_id ?? '';

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!currentUser?.email) {
      router.replace('/signin');
      return;
    }

    if (currentUser.email !== userId) {
      router.replace(`/${currentUser.email}/ai`);
    }
  }, [currentUser, loading, router, userId, sessionId]);

  if (loading) {
    return null;
  }

  if (!currentUser?.email || currentUser.email !== userId || !sessionId) {
    return null;
  }

  return <AISessionConversation userId={userId} sessionId={sessionId} />;
}
