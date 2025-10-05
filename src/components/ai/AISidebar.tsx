'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import { grayColor4, grayColor8 } from '@/constants/color'

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
  const activeSessionId = params?.session_id ?? null
  const userId = params?.userId ?? null
  const href = activeSessionId && userId ? `/${userId}/ai/${activeSessionId}` : null

  return (
    <aside
      className='flex w-[20%] h-full flex-col justify-between border-r px-4 py-6'
      style={{ borderColor: grayColor4, backgroundColor: grayColor8 }}
    >
      <nav className='flex flex-1 flex-col items-center gap-4'>
        <div className='flex w-full flex-col items-center gap-3'>
          {activeSessionId && href ? (
            <Link
              href={href}
              className='flex w-full justify-between items-center px-4 py-3 text-white transition-colors hover:border-white/50 hover:bg-white/10'
              aria-current='page'
              aria-label='Current AI session'
            >
              <span className='text-sm font-medium uppercase'>Current Session</span>
              <IconButton
              sx={{ p: 0, }}
               onClick={() => {}}
               >
                <MoreHorizIcon sx={{ color: 'white', fontSize: '24px' }}/>
              </IconButton>
            </Link>
          ) : (
            <div className='flex w-full flex-col items-center gap-1 rounded border border-dashed border-white/15 bg-transparent px-4 py-3 text-white/60'>
              <span className='text-sm font-medium uppercase'>No Session Selected</span>
              <span className='text-[10px]'>Start a conversation to see it here.</span>
            </div>
          )}
        </div>
      </nav>
    </aside>
  )
}
