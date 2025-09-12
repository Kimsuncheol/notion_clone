'use client'
import { grayColor3 } from '@/constants/color'
import { useInboxStore } from '@/store/inboxStore'
import React, { useState, useEffect } from 'react'
import { getUserNotifications } from '@/services/inbox/firebase'
import { Badge } from '@mui/material'

export default function InboxPageTabbar() {
  const { activeTab, setActiveTab } = useInboxStore()
  const [unreadCount, setUnreadCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const notifications = await getUserNotifications()
        setTotalCount(notifications.length)
        setUnreadCount(notifications.filter(n => !n.isRead).length)
      } catch (error) {
        console.error('Error loading notification counts:', error)
      }
    }
    
    loadCounts()
    // Set up an interval to refresh counts
    const interval = setInterval(loadCounts, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='flex flex-col'>
      {/* Main heading with badge */}
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-4xl font-bold" style={{ color: grayColor3 }}>
          Inbox
        </h1>
        {unreadCount > 0 && (
          <Badge 
            badgeContent={unreadCount} 
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '14px',
                height: '24px',
                minWidth: '24px',
                borderRadius: '12px',
              }
            }}
          />
        )}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center mb-6">
        <div className="flex border-b border-gray-600 w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors duration-200 relative ${
              activeTab === 'all'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              All
              {totalCount > 0 && (
                <span className="text-xs opacity-60">({totalCount})</span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-6 py-3 font-medium transition-colors duration-200 relative ${
              activeTab === 'unread'
                ? 'border-b-2 border-blue-500 text-blue-500'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              Unread
              {unreadCount > 0 && (
                <span className="text-xs opacity-60">({unreadCount})</span>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}