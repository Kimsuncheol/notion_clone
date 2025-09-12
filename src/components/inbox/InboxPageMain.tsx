'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { 
  grayColor3, 
  grayColor6, 
  grayColor2
} from '@/constants/color'
import { Button, IconButton, Skeleton } from '@mui/material'
import { useInboxStore } from '@/store/inboxStore'
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/services/inbox/firebase'
import { InboxItem } from '@/types/firebase'
import toast from 'react-hot-toast'
import DeleteIcon from '@mui/icons-material/Delete'
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'
import DoneIcon from '@mui/icons-material/Done'
import InboxIcon from '@mui/icons-material/Inbox'


export default function InboxPageMain() {
  const { activeTab } = useInboxStore()
  const [notifications, setNotifications] = useState<InboxItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const notificationsList = await getUserNotifications()
      setNotifications(notificationsList)
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadNotifications()
    return () => {
      setNotifications([]);
      setIsLoading(false);
    }
  }, [loadNotifications])

  // Filter notifications based on active tab
  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications

  // Handle mark as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
      toast.success('Marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Error marking all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }


  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'member_added':
        return '✅'
      case 'member_removed':
        return '❌'
      case 'role_changed':
        return '🔄'
      default:
        return '📢'
    }
  }

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <Skeleton
              variant="rectangular"
              height={100}
              sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px'
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  // Show empty state
  if (filteredNotifications.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <InboxIcon 
            sx={{ 
              fontSize: 64, 
              color: 'rgba(255, 255, 255, 0.3)',
              mb: 2 
            }} 
          />
          <div className="text-gray-400 text-lg mb-2">
            {activeTab === 'unread' 
              ? 'No unread notifications' 
              : 'No notifications yet'}
          </div>
          <div className="text-gray-500 text-sm">
            {activeTab === 'unread'
              ? 'New notifications will be displayed here.'
              : 'When you receive notifications, they will appear here.'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Mark all as read button */}
      {unreadCount > 0 && activeTab === 'all' && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleMarkAllAsRead}
            startIcon={<MarkEmailReadIcon />}
            variant="outlined"
            size="small"
            sx={{
              borderColor: '#666',
              color: grayColor3,
              '&:hover': {
                backgroundColor: grayColor6,
                borderColor: '#999',
              },
            }}
          >
            Mark all as read
          </Button>
        </div>
      )}

      {/* Notification items */}
      {filteredNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`flex items-start justify-between p-4 rounded-lg mb-4 transition-all duration-200 ${
            !notification.isRead 
              ? 'border-l-4 border-blue-500' 
              : ''
          }`}
          style={{ 
            backgroundColor: !notification.isRead 
              ? 'rgba(59, 130, 246, 0.1)' 
              : grayColor2 
          }}
        >
          <div className="flex items-start gap-4 flex-1">
            <div className="text-2xl mt-1">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1" style={{ color: grayColor3 }}>
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {notification.message}
                  </p>
                </div>
              </div>


              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.createdAt)}
                </span>

                <div className="flex items-center gap-2">

                  {/* Regular notification actions */}
                  {!notification.isRead && (
                    <IconButton
                      onClick={() => handleMarkAsRead(notification.id)}
                      size="small"
                      sx={{ color: '#3b82f6' }}
                      title="Mark as read"
                    >
                      <DoneIcon fontSize="small" />
                    </IconButton>
                  )}
                  
                  <IconButton
                    onClick={() => handleDeleteNotification(notification.id)}
                    size="small"
                    sx={{ color: '#ef4444' }}
                    title="Delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}