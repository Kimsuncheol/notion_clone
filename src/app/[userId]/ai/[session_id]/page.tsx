'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, Container } from '@mui/material'

import AIHeader from '@/components/ai/AIHeader'
import AIQuestionInput from '@/components/ai/AIQuestionInput'
import AIModelSelector from '@/components/ai/AIModelSelector'
import { AIModel, aiModels } from '@/components/ai/types'
import AIResponseDisplay from '@/components/ai/AIResponseDisplay'
import { fetchFastAIResponse, FastAIRequestError } from '@/services/ai/fetchFastAIResponse'
import AISidebar from '@/components/ai/AISidebar'
import { grayColor2 } from '@/constants/color'
import { useAISessionStore } from '@/components/ai/sessionTabs'

type ConversationEntry = {
  id: number
  prompt: string
  response: string
  isLoading: boolean
}

export default function AISessionPage({
  params,
}: {
  params: Promise<{ userId: string; session_id: string }>
}) {
  const { userId, session_id: sessionId } = React.use(params)
  const router = useRouter()
  const sessions = useAISessionStore((state) => state.sessions)
  const defaultSessionId = sessions[0]?.sessionId ?? null
  const sessionExists = useMemo(
    () => sessions.some((session) => session.sessionId === sessionId),
    [sessions, sessionId],
  )

  const [question, setQuestion] = useState('')
  const [selectedModel, setSelectedModel] = useState<AIModel>(aiModels[0])
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [responses, setResponses] = useState<ConversationEntry[]>([])
  const [isResponding, setIsResponding] = useState(false)
  const [inputToViewportBottom, setInputToViewportBottom] = useState(0)

  const requestIdRef = useRef<number>(0)
  const requestLockRef = useRef<boolean>(false)
  const responseContainerRef = useRef<HTMLDivElement>(null)
  const aiInputRef = useRef<HTMLDivElement>(null)
  const isMenuOpen = Boolean(anchorEl)
  const isGeneratingResponse = responses.some((entry) => entry.isLoading)
  const shouldShowResponse = responses.length > 0
  const isBusy = isResponding || isGeneratingResponse

  useEffect(() => {
    if (!sessionExists && defaultSessionId && userId) {
      router.replace(`/${userId}/ai/${defaultSessionId}`)
    }
  }, [defaultSessionId, router, sessionExists, userId])

  useEffect(() => {
    requestIdRef.current = 0
    requestLockRef.current = false
    setResponses([])
    setQuestion('')
    setIsResponding(false)
  }, [sessionId])

  const updateInputDistance = useCallback(() => {
    if (typeof window === 'undefined' || !aiInputRef.current) {
      return
    }

    const rect = aiInputRef.current.getBoundingClientRect()
    setInputToViewportBottom(window.innerHeight - rect.top)
  }, [])

  useEffect(() => {
    if (shouldShowResponse && responseContainerRef.current) {
      const container = responseContainerRef.current
      container.scrollTop = container.scrollHeight
    }
  }, [responses.length, shouldShowResponse])

  useEffect(() => {
    updateInputDistance()
  }, [updateInputDistance, responses.length, shouldShowResponse, isResponding])

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
      },
    ])
    setQuestion('')

    try {
      const aiResponse = await fetchFastAIResponse({
        prompt: trimmedQuestion,
        sessionId,
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
    } finally {
      if (requestIdRef.current === requestId) {
        requestLockRef.current = false
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('mock-ai:response-complete'))
        }
      }
    }
  }, [isBusy, question, sessionId])

  const handleKeyPress = (event: React.KeyboardEvent) => {
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

  const stackedResponseSx = useMemo(() => ({ mt: 0 }), [])
  const latestResponseId = responses.length ? responses[responses.length - 1].id : null

  const handleAnimationFinished = useCallback((responseId: number) => {
    if (requestIdRef.current === responseId) {
      setIsResponding(false)
    }
  }, [])

  return (
    <div className='flex min-h-screen' style={{ backgroundColor: grayColor2 }}>
      <AISidebar />
      <main className='flex-1 px-6 py-8'>
        <Box
          sx={{
            backgroundColor: 'transparent',
            color: 'white',
          }}
          data-ai-input-distance={inputToViewportBottom.toFixed(2)}
        >
          <Container maxWidth="md" className='px-4 py-8'>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '80vh',
                width: '100%',
                gap: 3,
              }}
            >
              <Box
                ref={responseContainerRef}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: shouldShowResponse ? 'flex-start' : 'center',
                  textAlign: 'center',
                  gap: shouldShowResponse ? 3 : 4,
                  flexGrow: 1,
                  width: '100%',
                  height: '100%',
                  overflowY: 'auto',
                  paddingBottom: shouldShowResponse ? 2 : 0,
                }}
              >
                {shouldShowResponse ? (
                  <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {responses.map((entry) => (
                      <AIResponseDisplay
                        key={entry.id}
                        response={entry.response}
                        isLoading={entry.isLoading}
                        prompt={entry.prompt}
                        sx={stackedResponseSx}
                        onAnimationFinished={
                          !entry.isLoading && latestResponseId === entry.id
                            ? () => handleAnimationFinished(entry.id)
                            : undefined
                        }
                      />
                    ))}
                  </Box>
                ) : (
                  <AIHeader />
                )}
              </Box>

              <Box sx={{ width: '100%', mt: shouldShowResponse ? 1 : 0 }}>
                <AIQuestionInput
                  ref={aiInputRef}
                  question={question}
                  selectedModel={selectedModel}
                  onChange={setQuestion}
                  onKeyPress={handleKeyPress}
                  onModelSelectorClick={handleModelSelectorClick}
                  onSearch={handleSearchRequest}
                  isBusy={isBusy}
                />
              </Box>

              <AIModelSelector
                anchorEl={anchorEl}
                isOpen={isMenuOpen}
                models={aiModels}
                selectedModel={selectedModel}
                onClose={handleMenuClose}
                onModelSelect={handleModelSelect}
              />
            </Box>
          </Container>
        </Box>
      </main>
    </div>
  )
}
