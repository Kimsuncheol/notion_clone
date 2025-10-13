'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import AIHeader from '@/components/ai/AIHeader'
import AIQuestionInput from '@/components/ai/AIQuestionInput'
import AIModelSelector from '@/components/ai/AIModelSelector'
import { AIModel, aiModels } from '@/components/ai/types'
import AIResponseDisplay from '@/components/ai/AIResponseDisplay'
import { fetchFastAIResponse, FastAIRequestError } from '@/services/ai/fetchFastAIResponse'
import AISidebar from '@/components/ai/AISidebar'
import { grayColor2 } from '@/constants/color'
import { getAISessionMessages, saveAIMessage } from '@/services/ai/firebase'
import type { StoredAIMessage } from '@/types/firebase'
import { useAuth } from '@/contexts/AuthContext'
import { useMarkdownStore } from '@/store/markdownEditorContentStore'
import { useAIStore } from '@/store/aiStore'
import { generateUUID } from '@/utils/generateUUID'

type ConversationEntry = {
  id: number
  prompt: string
  response: string
  isLoading: boolean
  timestamp: number
}

interface AISessionConversationProps {
  userId: string
  sessionId?: string
}

const AISessionConversation: React.FC<AISessionConversationProps> = ({ userId, sessionId: initialSessionId }) => {
  const [question, setQuestion] = useState('')
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [responses, setResponses] = useState<ConversationEntry[]>([])
  const [isResponding, setIsResponding] = useState(false)
  const [inputToViewportBottom, setInputToViewportBottom] = useState(0)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId ?? null)

  const addSessionId = useAIStore((state) => state.addSessionId)
  const setRecentlyOpenSessionID = useAIStore((state) => state.setRecentlyOpenSessionID)
  const refreshRequest = useAIStore((state) => state.refreshRequest)
  const clearRefreshRequest = useAIStore((state) => state.clearRefreshRequest)
  const resetSessionIds = useAIStore((state) => state.resetSessionIds)

  const { currentUser } = useAuth()
  const { avatar: storedAvatar, displayName: storedDisplayName } = useMarkdownStore()
  const userAvatarUrl = storedAvatar || currentUser?.photoURL || undefined
  const userDisplayName =
    storedDisplayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || undefined

  const requestIdRef = useRef<number>(0)
  const requestLockRef = useRef<boolean>(false)
  const responseContainerRef = useRef<HTMLDivElement>(null)
  const aiInputRef = useRef<HTMLDivElement>(null)
  const pendingSessionIdRef = useRef<string | null>(null)
  const responsesRef = useRef<ConversationEntry[]>([])
  const previousSessionIdRef = useRef<string | null>(initialSessionId ?? null)
  const isMenuOpen = Boolean(anchorEl)
  const isGeneratingResponse = responses.some((entry) => entry.isLoading)
  const shouldShowResponse = responses.length > 0
  const isBusy = isResponding || isGeneratingResponse
  const pathname = usePathname()
  const resetSessionIdsRef = useRef(resetSessionIds)
  const latestPathRef = useRef(pathname ?? '')

  const applySessionHistory = useCallback((history: StoredAIMessage[]) => {
    requestIdRef.current = history.length
    const historicalTimestamp = Date.now() - 60000
    setResponses(
      history.map((entry, index) => ({
        id: index + 1,
        prompt: entry.prompt,
        response: entry.response,
        isLoading: false,
        timestamp: historicalTimestamp,
      })),
    )
  }, [])

  const loadSessionHistory = useCallback(
    async (sessionIdentifier: string) => {
      if (!userId || !sessionIdentifier) {
        return []
      }

      try {
        return await getAISessionMessages({ userId, sessionId: sessionIdentifier })
      } catch (error) {
        console.error('Failed to load AI session history', error)
        return []
      }
    },
    [userId],
  )

  useEffect(() => {
    setActiveSessionId(initialSessionId ?? null)
  }, [initialSessionId])

  useEffect(() => {
    resetSessionIdsRef.current = resetSessionIds
  }, [resetSessionIds])

  useEffect(() => {
    latestPathRef.current = pathname ?? ''
  }, [pathname])

  useEffect(() => {
    responsesRef.current = responses
  }, [responses])

  useEffect(() => {
    return () => {
      if (!latestPathRef.current.includes('/ai')) {
        resetSessionIdsRef.current()
      }
    }
  }, [])

  useEffect(() => {
    if (!activeSessionId) {
      return
    }

    addSessionId(activeSessionId)
    setRecentlyOpenSessionID(activeSessionId)
  }, [activeSessionId, addSessionId, setRecentlyOpenSessionID])

  useEffect(() => {
    const previousSessionId = previousSessionIdRef.current
    previousSessionIdRef.current = activeSessionId ?? null

    const transitioningFromFreshSession =
      !previousSessionId && Boolean(activeSessionId) && responsesRef.current.length > 0

    if (transitioningFromFreshSession) {
      return
    }

    let isMounted = true

    requestIdRef.current = 0
    requestLockRef.current = false
    setResponses([])
    setQuestion('')
    setIsResponding(false)

    if (!activeSessionId) {
      return () => {
        isMounted = false
      }
    }

    const hydrateHistory = async () => {
      const history = await loadSessionHistory(activeSessionId)

      if (!isMounted) {
        return
      }

      applySessionHistory(history)
    }

    void hydrateHistory()

    return () => {
      isMounted = false
    }
  }, [activeSessionId, loadSessionHistory, applySessionHistory])

  const updateInputDistance = useCallback(() => {
    if (typeof window === 'undefined' || !aiInputRef.current) {
      return
    }

    const rect = aiInputRef.current.getBoundingClientRect()
    setInputToViewportBottom(window.innerHeight - rect.top)
  }, [])

  const scrollResponsesToBottom = useCallback(() => {
    const container = responseContainerRef.current
    if (!container) {
      return
    }

    const scroll = () => {
      container.scrollTop = container.scrollHeight
    }

    requestAnimationFrame(() => {
      scroll()
      requestAnimationFrame(scroll)
    })
  }, [])

  useEffect(() => {
    if (shouldShowResponse) {
      scrollResponsesToBottom()
    }
  }, [responses, shouldShowResponse, scrollResponsesToBottom])

  useEffect(() => {
    if (!refreshRequest || refreshRequest.sessionId !== activeSessionId) {
      return
    }

    let isActive = true
    const { requestId, sessionId } = refreshRequest

    const refreshHistory = async () => {
      const history = await loadSessionHistory(sessionId)

      if (isActive) {
        applySessionHistory(history)
      }

      clearRefreshRequest(requestId)
    }

    void refreshHistory()

    return () => {
      isActive = false
    }
  }, [refreshRequest, activeSessionId, loadSessionHistory, applySessionHistory, clearRefreshRequest])

  useEffect(() => {
    updateInputDistance()
    if (shouldShowResponse) {
      scrollResponsesToBottom()
    }
  }, [updateInputDistance, scrollResponsesToBottom, responses, shouldShowResponse, isResponding])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    const handleWindowMetrics = () => {
      updateInputDistance()
    }

    window.addEventListener('resize', handleWindowMetrics)
    window.addEventListener('scroll', handleWindowMetrics, { passive: true })

    return () => {
      window.removeEventListener('resize', handleWindowMetrics)
      window.removeEventListener('scroll', handleWindowMetrics)
    }
  }, [updateInputDistance])

  const handleModelSelectorClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleModelSelect = (model: AIModel) => {
    setSelectedModel(model)
    handleMenuClose()
  }

  const persistSessionMessage = useCallback(
    async (sessionIdentifier: string, promptText: string, responseText: string) => {
      if (!userId || !sessionIdentifier) {
        return
      }

      try {
        await saveAIMessage({
          userId,
          sessionId: sessionIdentifier,
          prompt: promptText,
          response: responseText,
        })
      } catch (error) {
        console.error('Failed to save AI session message', error)
      }
    },
    [userId],
  )

  const handleSearch = useCallback(async () => {
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion || isBusy || requestLockRef.current) {
      return
    }

    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    requestLockRef.current = true
    setIsResponding(true)

    setResponses((prev) => [
      ...prev,
      {
        id: requestId,
        prompt: trimmedQuestion,
        response: '',
        isLoading: true,
        timestamp: Date.now(),
      },
    ])
    setQuestion('')

    const currentSessionId = activeSessionId ?? pendingSessionIdRef.current ?? generateUUID()
    if (!activeSessionId && !pendingSessionIdRef.current) {
      pendingSessionIdRef.current = currentSessionId
    }

    try {
      const aiResponse = await fetchFastAIResponse({
        prompt: trimmedQuestion,
        sessionId: currentSessionId,
      })

      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId
            ? {
              ...entry,
              response: aiResponse,
              isLoading: false,
            }
            : entry,
        ),
      )
      setIsResponding(false)
      await persistSessionMessage(currentSessionId, trimmedQuestion, aiResponse)
      if (!activeSessionId) {
        setActiveSessionId(currentSessionId)
      }
      pendingSessionIdRef.current = null
    } catch (error) {
      const fallbackMessage =
        error instanceof FastAIRequestError
          ? error.message
          : 'Unable to generate a response right now. Please try again.'

      console.error('FAST API response error', error)
      setResponses((prev) =>
        prev.map((entry) =>
          entry.id === requestId
            ? {
              ...entry,
              response: fallbackMessage,
              isLoading: false,
            }
            : entry,
        ),
      )
      setIsResponding(false)
      if (activeSessionId) {
        void persistSessionMessage(activeSessionId, trimmedQuestion, fallbackMessage)
      }
      if (!activeSessionId) {
        pendingSessionIdRef.current = null
      }
    } finally {
      if (requestIdRef.current === requestId) {
        requestLockRef.current = false
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mock-ai:response-complete'))
        }
      }
    }
  }, [activeSessionId, isBusy, persistSessionMessage, question])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!isBusy && !requestLockRef.current) {
        void handleSearch()
      }
    }
  }

  const handleSearchRequest = () => {
    if (!isBusy && !requestLockRef.current) {
      void handleSearch()
    }
  }

  const stackedResponseStyle = useMemo<React.CSSProperties>(() => ({ marginTop: 0 }), [])
  const latestResponseId = responses.length ? responses[responses.length - 1].id : null

  const shouldAnimateResponse = useCallback((entry: ConversationEntry) => {
    const currentTime = Date.now()
    const timeDifference = currentTime - entry.timestamp
    return timeDifference < 5000
  }, [])

  const handleAnimationFinished = useCallback((responseId: number) => {
    if (requestIdRef.current === responseId) {
      setIsResponding(false)
    }
  }, [])

  return (
    <div className='flex h-full' style={{ backgroundColor: grayColor2 }}>
      <AISidebar />
      <main className='flex-1 px-6 py-8'>
        <div className='bg-transparent text-white' data-ai-input-distance={inputToViewportBottom.toFixed(2)}>
          <div className='px-4 py-8 w-[90%] mx-auto'>
            <div className='flex flex-col h-[80vh] w-full gap-6'>
              <div
                className={`flex flex-col items-center ${shouldShowResponse ? 'flex-start' : 'center'} text-center ${shouldShowResponse ? '24px' : '32px'} grow w-full h-full overflow-y-auto ${shouldShowResponse && 'pb-4'}`}
                ref={responseContainerRef}
              >
                {shouldShowResponse ? (
                  <div className='w-full h-full flex flex-col gap-6'>
                    {responses.map((entry) => (
                      <AIResponseDisplay
                        key={entry.id}
                        response={entry.response}
                        isLoading={entry.isLoading}
                        prompt={entry.prompt}
                        isLatestResponse={latestResponseId === entry.id}
                        style={stackedResponseStyle}
                        userAvatarUrl={userAvatarUrl}
                        userDisplayName={userDisplayName}
                        disableAnimation={!shouldAnimateResponse(entry)}
                        onAnimationFinished={
                          !entry.isLoading && latestResponseId === entry.id
                            ? () => handleAnimationFinished(entry.id)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <AIHeader />
                )}
              </div>

              <div className={`w-full ${shouldShowResponse && '8px'}`}>
                <AIQuestionInput
                  ref={aiInputRef}
                  question={question}
                  selectedModel={selectedModel}
                  onChange={setQuestion}
                  onKeyDown={handleKeyDown}
                  onModelSelectorClick={handleModelSelectorClick}
                  onSearch={handleSearchRequest}
                  isBusy={isBusy}
                />
              </div>

              <AIModelSelector
                anchorEl={anchorEl}
                isOpen={isMenuOpen}
                models={aiModels}
                selectedModel={selectedModel}
                onClose={handleMenuClose}
                onModelSelect={handleModelSelect}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AISessionConversation
