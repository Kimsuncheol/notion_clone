'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { generateUUID } from '@/utils/generateUUID'

export default function AIPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = React.use(params)
  const router = useRouter()
  const [sessionId, setSessionId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!userId) {
      return
    }

    setSessionId(generateUUID())
  }, [userId])

  React.useEffect(() => {
    if (!userId || !sessionId) {
      return
    }

    router.replace(`/${userId}/ai/${sessionId}`)
  }, [router, sessionId, userId])

  return null
}
