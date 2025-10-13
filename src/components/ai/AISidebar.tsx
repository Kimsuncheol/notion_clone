'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

import { grayColor4, grayColor8 } from '@/constants/color'
import { useAIStore } from '@/store/aiStore'
import { deleteAISession, deleteChatHistory, getAISessionIds } from '@/services/ai/firebase'
import AISidebarMenu from '@/components/ai/AISidebarMenu'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { IconButton } from '@mui/material'
import toast from 'react-hot-toast'

const formatSessionId = (value: string) => {
  if (value.length <= 16) {
    return value
  }

  const prefix = value.slice(0, 8)
  const suffix = value.slice(-4)
  return `${prefix}…${suffix}`
}

const formatSessionSummary = (summary: string | null | undefined, sessionId: string) => {
  const normalized = summary?.trim()
  if (!normalized) {
    return formatSessionId(sessionId)
  }

  const limit = 60
  if (normalized.length <= limit) {
    return normalized
  }

  return `${normalized.slice(0, limit - 1)}…`
}

export default function AISidebar() {
  const params = useParams<{ userId: string; session_id?: string }>()
  const sessions = useAIStore((state) => state.sessions)
  const recentlyOpenSessionID = useAIStore((state) => state.recentlyOpenSessionID)
  const triggerRefreshSession = useAIStore((state) => state.triggerRefreshSession)
  const removeSessionId = useAIStore((state) => state.removeSessionId)
  const setSessionIds = useAIStore((state) => state.setSessionIds)
  
  const activeSessionId = params?.session_id ?? recentlyOpenSessionID ?? null
  const userId = params?.userId ?? null
  const hasSessions = sessions.length > 0

  const router = useRouter()
  const containerRef = useRef<HTMLElement | null>(null)
  const [menuState, setMenuState] = useState<{
    sessionId: string
    x: number
    y: number
  } | null>(null)
  const [isProcessingAction, setIsProcessingAction] = useState(false)

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true

    const loadSessions = async () => {
      try {
        const fetchedSessionIds = await getAISessionIds({ userId })

        if (!isMounted) {
          return
        }

        setSessionIds(fetchedSessionIds)
      } catch (error) {
        console.error('Failed to load AI sessions', error)
      }
    }

    void loadSessions()

    return () => {
      isMounted = false
    }
  }, [userId, setSessionIds])

  const menuPosition = useMemo(() => {
    if (!menuState) {
      return null
    }

    const container = containerRef.current
    if (!container) {
      return { x: menuState.x, y: menuState.y }
    }

    const rect = container.getBoundingClientRect()
    const menuWidth = 192
    const menuHeight = 160

    const maxX = Math.max(0, rect.width - menuWidth)
    const maxY = Math.max(0, rect.height - menuHeight)

    return {
      x: Math.min(Math.max(0, menuState.x), maxX),
      y: Math.min(Math.max(0, menuState.y), maxY),
    }
  }, [menuState])

  const closeMenu = useCallback(() => {
    setMenuState(null)
    setIsProcessingAction(false)
  }, [])

  const openContextMenu = useCallback(
    (event: ReactMouseEvent<HTMLElement>, sessionId: string) => {
      event.preventDefault()
      event.stopPropagation()

      const container = containerRef.current
      if (!container) {
        return
      }

      const rect = container.getBoundingClientRect()
      const relativeX = event.clientX - rect.left
      const relativeY = event.clientY - rect.top

      setMenuState({ sessionId, x: relativeX, y: relativeY })
    },
    [],
  )

  const handleRename = useCallback(() => {
    closeMenu()
  }, [closeMenu])

  const handleRefresh = useCallback(() => {
    if (!menuState?.sessionId) {
      return
    }
    const sessionId = menuState.sessionId

    triggerRefreshSession(menuState.sessionId)
    // import 'deleteChatHistory' from 'ai/firebase.ts' file
    deleteChatHistory(userId, sessionId)
    toast.success('AI session refreshed')
    closeMenu()
  }, [menuState, triggerRefreshSession, closeMenu, userId])

  const handleDelete = useCallback(async () => {
    if (!menuState?.sessionId || !userId || isProcessingAction) {
      return
    }

    const sessionId = menuState.sessionId
    setIsProcessingAction(true)

    try {
      await deleteAISession({ userId, sessionId })
      removeSessionId(sessionId)
      toast.success('AI session deleted')

      if (sessionId === activeSessionId) {
        router.push(`/${userId}/ai`)
      }
    } catch (error) {
      console.error('Failed to delete AI session', error)
      toast.error('Failed to delete AI session')
    } finally {
      closeMenu()
    }
  }, [menuState, userId, isProcessingAction, removeSessionId, activeSessionId, router, closeMenu])

  return (
    <aside
      ref={containerRef}
      className='relative flex w-[20%] h-full flex-col justify-between border-r px-2 py-6'
      style={{ borderColor: grayColor4, backgroundColor: grayColor8 }}
    >
      <nav className='flex flex-1 flex-col items-center w-full'>
        <div className='flex w-full flex-col items-start gap-2'>
          {hasSessions ? (
            <ul className='flex w-full flex-col gap-2'>
              {sessions.map((session) => {
                const sessionId = session.sessionId
                const sessionSummary = formatSessionSummary(session.summary, sessionId)
                const isActive = activeSessionId === sessionId
                const sessionHref = userId ? `/${userId}/ai/${sessionId}` : null

                const sharedClasses = 'flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors'

                if (sessionHref) {
                  return (
                    <li
                      key={sessionId}
                      onContextMenu={(event) => openContextMenu(event, sessionId)}
                      className={`flex items-center justify-between py-1
                      ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                    >
                      <Link
                        href={sessionHref}
                        className={`${sharedClasses}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className='text-xs font-medium'>{sessionSummary}</span>
                      </Link>
                      <IconButton
                        aria-label='more'
                        size='small'
                        sx={{ color: 'white' }}
                        onClick={(event) => openContextMenu(event, sessionId)}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </li>
                  )
                }

                return (
                  <li key={sessionId} onContextMenu={(event) => openContextMenu(event, sessionId)}>
                    <div
                      className={`${sharedClasses} ${
                        isActive ? 'bg-white/20 text-white' : 'text-white/50'
                      }`}
                    >
                      <span className='text-xs font-medium'>{sessionSummary}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div className='w-full rounded border border-dashed border-white/15 px-3 py-4 text-center text-xs text-white/50'>
              No AI sessions yet. Ask something to create one.
            </div>
          )}
        </div>
      </nav>

      {menuState && menuPosition && (
        <AISidebarMenu
          position={menuPosition}
          sessionId={menuState.sessionId}
          isProcessingAction={isProcessingAction}
          onRename={handleRename}
          onRefresh={handleRefresh}
          onDelete={handleDelete}
          onClose={closeMenu}
        />
      )}
    </aside>
  )
}
