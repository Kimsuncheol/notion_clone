'use client'

import React from 'react'

import AISessionConversation from '@/components/ai/AISessionConversation'

export default function AIPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = React.use(params)

  if (!userId) {
    return null
  }

  return <AISessionConversation userId={userId} />
}
