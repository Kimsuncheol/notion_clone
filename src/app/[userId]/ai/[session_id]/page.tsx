'use client'

import React from 'react'

import AISessionConversation from '@/components/ai/AISessionConversation'

export default function AISessionPage({
  params,
}: {
  params: Promise<{ userId: string; session_id: string }>
}) {
  const { userId, session_id: sessionId } = React.use(params)

  if (!userId || !sessionId) {
    return null
  }

  return <AISessionConversation userId={userId} sessionId={sessionId} />
}

