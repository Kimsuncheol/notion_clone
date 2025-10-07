'use client'

import { useEffect, useRef } from 'react'

interface AISidebarMenuProps {
  position: { x: number; y: number }
  sessionId: string
  isProcessingAction: boolean
  onRename: () => void
  onRefresh: () => void
  onDelete: () => void
  onClose: () => void
}

export default function AISidebarMenu({
  position,
  sessionId,
  isProcessingAction,
  onRename,
  onRefresh,
  onDelete,
  onClose,
}: AISidebarMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleGlobalMouseDown = (event: MouseEvent) => {
      const target = event.target as Node | null
      if (menuRef.current && target && !menuRef.current.contains(target)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleGlobalMouseDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleGlobalMouseDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  return (
    <div
      ref={menuRef}
      className='absolute z-50 min-w-[12rem] overflow-hidden rounded-md border border-white/10 bg-[#1f1f1f] text-sm text-white shadow-lg'
      style={{ top: position.y, left: position.x }}
      aria-label={`Actions for session ${sessionId}`}
    >
      <button
        type='button'
        className='flex w-full items-center justify-between px-4 py-2 text-left hover:bg-white/10'
        onClick={onRename}
        disabled={isProcessingAction}
      >
        <span>Rename</span>
        <span className='text-xs text-white/40'>Coming soon</span>
      </button>
      <button
        type='button'
        className='flex w-full items-center px-4 py-2 text-left hover:bg-white/10'
        onClick={onRefresh}
        disabled={isProcessingAction}
      >
        Refresh
      </button>
      <button
        type='button'
        className='flex w-full items-center px-4 py-2 text-left text-red-400 hover:bg-red-500/20'
        onClick={onDelete}
        disabled={isProcessingAction}
      >
        Delete
      </button>
    </div>
  )
}
