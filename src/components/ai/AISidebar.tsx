'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { grayColor4, grayColor8 } from '@/constants/color'
import { useAISessionStore } from './sessionTabs'

export default function AISidebar() {
  const params = useParams<{ userId: string; session_id?: string }>()
  const activeSessionId = params?.session_id
  const userId = params?.userId
  const sessions = useAISessionStore((state) => state.sessions)

  return (
    <aside
      className='flex w-[20%] flex-col justify-between border-r px-4 py-6'
      style={{ borderColor: grayColor4, backgroundColor: grayColor8 }}
    >
      <nav className='flex flex-1 flex-col items-center gap-4'>
        <div className='flex w-full flex-col items-center'>
          {sessions.map((session, index) => {
            const isActive = session.sessionId === activeSessionId
            const href = userId ? `/${userId}/ai/${session.sessionId}` : '#'

            return (
              <Link
                key={session.sessionId}
                href={href}
                className={
                  `flex w-full flex-col items-center px-4 py-3 text-white transition-colors ${isActive
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/10 bg-transparent hover:border-white/30 hover:bg-white/5'
                  }
                  border-dashed
                  ${index === 0 ? 'border-y' : 'border-b'}
                  `}
                aria-current={isActive ? 'page' : undefined}
                aria-label={session.label}
              >
                <span className='text-sm font-medium uppercase'>{session.label}</span>
                <span className='text-[10px] text-white/50'>{session.sessionId}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}
