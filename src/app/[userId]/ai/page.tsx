'use client';

import React from 'react';

import AISessionConversation from '@/components/ai/AISessionConversation';

type AIPageParams = { userId: string };

export default function AIPage({ params }: { params: Promise<AIPageParams> }) {
  const { userId } = React.use(params);

  if (!userId) {
    return null;
  }

  return <AISessionConversation userId={userId} />;
}
