'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  deleteNotification,
  acceptWorkspaceInvitation,
  declineWorkspaceInvitation,
  type NotificationItem
} from '@/services/firebase';
import { useColorStore } from '@/store/colorStore';
import toast from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import InboxIcon from '@mui/icons-material/Inbox';

interface WorkspaceInvitationData extends Record<string, unknown> {
  invitationId?: string;
  workspaceName?: string;
  role?: string;
  workspaceId?: string;
  inviterName?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onNotificationCountChange?: (count: number) => void;
}

// Type guard function
const isWorkspaceInvitationData = (data: Record<string, unknown>): data is WorkspaceInvitationData => {
  return typeof data === 'object' && data !== null;
};

const Inbox: React.FC<Props> = ({ open, onClose, onNotificationCountChange }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const backgroundColor = useColorStore(state => state.backgroundColor);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const notificationsList = await getUserNotifications();
      setNotifications(notificationsList);
      
      // Update unread count
      const unreadCount = notificationsList.filter(n => !n.isRead).length;
      onNotificationCountChange?.(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [onNotificationCountChange]);

  // Load notifications when component opens
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);
  
  // Click outside to close inbox sidebar
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.inbox-sidebar-content') && !target.closest('#inbox-toggle')) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);
  
  // Handle Escape key to close inbox sidebar
  useEffect(() => {
    if (!open) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      
      // Update unread count
      const unreadCount = notifications.filter(n => !n.isRead && n.id !== notificationId).length;
      onNotificationCountChange?.(unreadCount);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      onNotificationCountChange?.(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count
      const deletedNotification = notifications.find(n => n.id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        const unreadCount = notifications.filter(n => !n.isRead).length - 1;
        onNotificationCountChange?.(unreadCount);
      }
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleAcceptInvitation = async (notificationId: string, invitationId: string) => {
    setProcessingIds(prev => new Set(prev).add(notificationId));
    
    try {
      await acceptWorkspaceInvitation(invitationId);
      // Remove the notification
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast.success('Workspace invitation accepted!');
      
      // Update unread count
      const acceptedNotification = notifications.find(n => n.id === notificationId);
      if (acceptedNotification && !acceptedNotification.isRead) {
        const unreadCount = notifications.filter(n => !n.isRead).length - 1;
        onNotificationCountChange?.(unreadCount);
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to accept invitation');
      }
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (notificationId: string, invitationId: string) => {
    setProcessingIds(prev => new Set(prev).add(notificationId));
    
    try {
      await declineWorkspaceInvitation(invitationId);
      // Remove the notification
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      toast.success('Workspace invitation declined');
      
      // Update unread count
      const declinedNotification = notifications.find(n => n.id === notificationId);
      if (declinedNotification && !declinedNotification.isRead) {
        const unreadCount = notifications.filter(n => !n.isRead).length - 1;
        onNotificationCountChange?.(unreadCount);
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to decline invitation');
      }
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'workspace_invitation':
        return '👥';
      case 'member_added':
        return '✅';
      case 'member_removed':
        return '❌';
      case 'role_changed':
        return '🔄';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!open) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div 
      className="w-80 fixed top-0 left-60 text-gray-100 border-r border-gray-700 inbox-sidebar-content z-50"
      style={{ backgroundColor }}
    >
        <div className="flex flex-col h-full">
          {/* Header */}
          {/* Please don't touch below code */}
          <div className="flex items-center justify-between p-2 border-b border-gray-700 text-sm">
            <div className="flex items-center gap-2 text-sm">
              <InboxIcon className="text-blue-400" fontSize="inherit" />
              <span className="text-sm font-semibold text-gray-100">
                Inbox
              </span>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  title="Mark all as read"
                >
                  <MarkEmailReadIcon fontSize="small" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                title="Close inbox"
              >
                <CloseIcon fontSize="inherit" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto h-full">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-700 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 px-6 text-sm">
                <div className="text-4xl mb-3">📬</div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                  Inbox is empty
                </h3>
                <p className="text-gray-400 text-sm">
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700 text-sm">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors ${
                      !notification.isRead 
                        ? 'bg-blue-900/20 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    {/* Please don't touch below code */}
                    <div className="flex items-start gap-3">
                      <div className="text-sm"> 
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1 text-sm">
                          <h4 className="font-medium text-gray-100 text-sm">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Mark as read"
                              >
                                <CheckIcon fontSize="inherit" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-red-400 hover:text-red-300 transition-colors"
                              title="Delete notification"
                            >
                              <DeleteIcon fontSize="inherit" />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        
                        {/* Workspace invitation actions */}
                        {notification.type === 'workspace_invitation' && (() => {
                          const data = isWorkspaceInvitationData(notification.data) ? notification.data : null;
                          const invitationId = data?.invitationId;
                          return invitationId && (
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => handleDeclineInvitation(
                                  notification.id, 
                                  invitationId
                                )}
                                disabled={processingIds.has(notification.id)}
                                className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors disabled:opacity-50"
                              >
                                <ClearIcon fontSize="inherit" className="mr-1" />
                                Decline
                              </button>
                              <button
                                onClick={() => handleAcceptInvitation(
                                  notification.id, 
                                  invitationId
                                )}
                                disabled={processingIds.has(notification.id)}
                                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors disabled:opacity-50"
                              >
                                <CheckIcon fontSize="small" className="mr-1" />
                                Accept
                              </button>
                            </div>
                          );
                        })()}
                        
                        {/* Additional info for workspace invitations */}
                        {notification.type === 'workspace_invitation' && (() => {
                          const data = isWorkspaceInvitationData(notification.data) ? notification.data : null;
                          return data?.workspaceName && (
                            <div className="mt-2 text-xs text-gray-400">
                              Workspace: <span className="font-medium">{data.workspaceName}</span>
                              {data.role && (
                                <span className="ml-2">Role: <span className="font-medium capitalize">{data.role}</span></span>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 text-center">
              <p className="text-xs text-gray-400">
                {notifications.length} total notification{notifications.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
  );
};

export default Inbox; 