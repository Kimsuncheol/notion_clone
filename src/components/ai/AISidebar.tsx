'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { grayColor4, grayColor8 } from '@/constants/color'
import { useAIStore } from '@/store/aiStore'

import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { IconButton } from '@mui/material';

const formatSessionId = (value: string) => {
  if (value.length <= 16) {
    return value
  }

  const prefix = value.slice(0, 8)
  const suffix = value.slice(-4)
  return `${prefix}…${suffix}`
}

export default function AISidebar() {
  const params = useParams<{ userId: string; session_id?: string }>()
  const sessionIds = useAIStore((state) => state.sessionIds)
  const recentlyOpenSessionID = useAIStore((state) => state.recentlyOpenSessionID)

  const activeSessionId = params?.session_id ?? recentlyOpenSessionID ?? null
  const userId = params?.userId ?? null
  const hasSessions = sessionIds.length > 0

  return (
    <aside
      className='flex w-[20%] h-full flex-col justify-between border-r px-2 py-6'
      style={{ borderColor: grayColor4, backgroundColor: grayColor8 }}
    >
      <nav className='flex flex-1 flex-col items-center w-full'>
        <div className='flex w-full flex-col items-start gap-2'>
          {hasSessions ? (
            <ul className='flex w-full flex-col gap-2'>
              {sessionIds.map((sessionId) => {
                const isActive = activeSessionId === sessionId
                const sessionHref = userId ? `/${userId}/ai/${sessionId}` : null

                const sharedClasses = 'flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors'

                if (sessionHref) {
                  return (
                    <li key={sessionId} className={`flex items-center justify-between py-1
                      ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}>
                      <Link
                        href={sessionHref}
                        className={`${sharedClasses}`}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className='font-mono text-xs'>{formatSessionId(sessionId)}</span>
                      </Link>
                      <IconButton
                        aria-label='more'
                        size='small'
                        sx={{ color: 'white' }}
                      >
                        <MoreHorizIcon />
                      </IconButton>
                    </li>
                  )
                }

                return (
                  <li key={sessionId}>
                    <div
                      className={`${sharedClasses} ${
                        isActive ? 'bg-white/20 text-white' : 'text-white/50'
                      }`}
                    >
                      <span className='font-mono text-xs'>{formatSessionId(sessionId)}</span>
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
    </aside>
  )
}
