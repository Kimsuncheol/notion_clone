'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { useAISessionStore } from '@/components/ai/sessionTabs'

export default function AIPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = React.use(params)
  const router = useRouter()
  const defaultSessionId = useAISessionStore((state) => state.sessions[0]?.sessionId ?? null)

  React.useEffect(() => {
    if (!defaultSessionId || !userId) {
      return
    }

    router.replace(`/${userId}/ai/${defaultSessionId}`)
  }, [defaultSessionId, router, userId])

  return null
}
