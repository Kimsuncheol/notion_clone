'use client';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SortIcon from '@mui/icons-material/Sort';
import InboxIcon from '@mui/icons-material/Inbox';
import ManualSidebar from './ManualSidebar';
import ChatRoomSidebar from './ChatRoomSidebar';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { 
  getAdminSupportConversations, 
  getUserSupportConversations,
  subscribeToAdminUnreadCounts,
  subscribeToUserUnreadAdminMessages
} from '@/services/firebase';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Updated interface to match Firebase data
interface ChatConversation {
  id: string;
  userEmail: string;
  userName: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
  type?: 'contact' | 'bug' | 'feedback';
}

type SortOption = 'newest' | 'oldest' | 'unread' | 'name';
type UserSortOption = 'newest' | 'oldest' | 'type';

const HelpContactMoreSidebar: React.FC<Props> = ({ open, onClose }) => {
  type ActiveView = 'main' | 'manual' | 'chat' | 'contact-inbox' | 'bug-inbox' | 'feedback-inbox' | 'user-inbox';
  const [activeView, setActiveView] = useState<ActiveView>('main');
  const [chatType, setChatType] = useState<'contact' | 'bug' | 'feedback'>('contact');
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [conversations, setConversations] = useState<Record<string, ChatConversation[]>>({
    contact: [],
    bug: [],
    feedback: []
  });
  const [userConversations, setUserConversations] = useState<ChatConversation[]>([]);
  const [sortBy, setSortBy] = useState<Record<string, SortOption>>({
    contact: 'newest',
    bug: 'newest',
    feedback: 'newest'
  });
  const [userSortBy, setUserSortBy] = useState<UserSortOption>('newest');
  const [unreadCounts, setUnreadCounts] = useState({
    contact: 0,
    bug: 0,
    feedback: 0,
    total: 0
  });
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const auth = getAuth(firebaseApp);

  // Check if current user is administrator
  const isAdmin = auth.currentUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // Set up real-time listeners for unread counts
  useEffect(() => {
    if (!open || !auth.currentUser) return;

    let unsubscribe: (() => void) | null = null;

    if (isAdmin) {
      // Admin: Listen to all unread support messages
      unsubscribe = subscribeToAdminUnreadCounts((counts) => {
        setUnreadCounts(counts);
      });
    } else {
      // User: Listen to unread admin messages
      unsubscribe = subscribeToUserUnreadAdminMessages((counts) => {
        setUnreadCounts(counts);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAdmin, open, auth.currentUser]);

  // Load conversations when entering inbox view or sort changes
  useEffect(() => {
    const loadConversations = async () => {
      if (!activeView.includes('-inbox')) return;

      setIsLoadingConversations(true);
      try {
        if (isAdmin && activeView !== 'user-inbox') {
          // Admin loading specific type conversations
          const type = activeView.replace('-inbox', '') as 'contact' | 'bug' | 'feedback';
          const currentSort = sortBy[type];
          const supportConversations = await getAdminSupportConversations(type, currentSort);
        
          // Convert to ChatConversation format
          const chatConversations: ChatConversation[] = supportConversations.map(conv => ({
            id: conv.id,
            userEmail: conv.userEmail,
            userName: conv.userName,
            lastMessage: conv.lastMessage,
            timestamp: conv.lastMessageAt,
            unreadCount: conv.unreadCount
          }));

          setConversations(prev => ({
            ...prev,
            [type]: chatConversations
          }));
        } else if (activeView === 'user-inbox') {
          // User loading their conversations
          const supportConversations = await getUserSupportConversations(userSortBy);
          
          // Convert to ChatConversation format with additional type info
          const chatConversations: ChatConversation[] = supportConversations.map(conv => ({
            id: conv.id,
            userEmail: conv.userEmail,
            userName: conv.userName,
            lastMessage: conv.lastMessage,
            timestamp: conv.lastMessageAt,
            unreadCount: conv.unreadCount,
            type: conv.type
          }));

          setUserConversations(chatConversations);
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [isAdmin, activeView, sortBy, userSortBy]);

  // When the component is closed from the parent, reset the view
  useEffect(() => {
    if (!open) {
      setActiveView('main');
      setSelectedConversation(null);
    }
  }, [open]);

  // Click outside to close sidebar
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Close everything if clicking outside of any of the potential sidebars
      if (
        !target.closest('.help-contact-more-sidebar-content') &&
        !target.closest('.manual-sidebar-content') &&
        !target.closest('.chat-room-sidebar-content') &&
        !target.closest('#help-contact-more-button')
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  // Handle Escape key to close sidebar
  useEffect(() => {
    if (!open) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // If in a sub-view, go back to main, otherwise close everything
        if (activeView !== 'main') {
          setActiveView('main');
          setSelectedConversation(null);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose, activeView]);

  const handleOpenChat = (type: 'contact' | 'bug' | 'feedback') => {
    setChatType(type);
    if (isAdmin) {
      // Show inbox for admin
      setActiveView(`${type}-inbox` as ActiveView);
    } else {
      // Show chat room for regular users
      setActiveView('chat');
    }
  };

  const handleOpenUserInbox = () => {
    setActiveView('user-inbox');
  };

  const handleOpenManual = () => {
    setActiveView('manual');
  };

  const handleBackToMain = () => {
    setActiveView('main');
    setSelectedConversation(null);
  };

  const handleBackToInbox = () => {
    setActiveView(`${chatType}-inbox` as ActiveView);
    setSelectedConversation(null);
  };

  const handleOpenConversation = (conversation: ChatConversation, type: 'contact' | 'bug' | 'feedback') => {
    setSelectedConversation(conversation);
    setChatType(type);
    setActiveView('chat');
  };

  const handleSortChange = (type: 'contact' | 'bug' | 'feedback', newSort: SortOption) => {
    setSortBy(prev => ({
      ...prev,
      [type]: newSort
    }));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const renderUserInbox = () => {
    return (
      <div className="w-[400px] h-[500px] p-4 rounded-lg absolute left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm help-contact-more-sidebar-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToMain}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Back to main"
            >
              <ArrowBackIcon fontSize="small" />
            </button>
            <div className="flex items-center gap-2">
              <InboxIcon fontSize="small" className="text-purple-400" />
              <h2 className="text-lg font-bold">My Conversations</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Close inbox"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
          <span className="text-sm text-gray-400">
            {userConversations.length} conversation{userConversations.length !== 1 ? 's' : ''}
          </span>
          <div className="relative">
            <select
              value={userSortBy}
              onChange={(e) => setUserSortBy(e.target.value as UserSortOption)}
              className="bg-gray-700 text-white text-xs px-3 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none pr-8"
              title="Sort conversations"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="type">By Type</option>
            </select>
            <SortIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" fontSize="small" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
          {isLoadingConversations ? (
            <div className="text-center py-8 text-gray-400">
              <p>Loading conversations...</p>
            </div>
          ) : userConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <InboxIcon fontSize="large" className="mb-2" />
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Start a conversation using the options above</p>
            </div>
          ) : (
            userConversations.map((conversation) => {
              const getTypeIcon = () => {
                switch (conversation.type) {
                  case 'contact': return <ContactSupportIcon fontSize="small" className="text-orange-400" />;
                  case 'bug': return <BugReportIcon fontSize="small" className="text-red-400" />;
                  case 'feedback': return <EmailIcon fontSize="small" className="text-cyan-400" />;
                  default: return <PersonIcon className="text-gray-400" fontSize="small" />;
                }
              };

              const getTypeBadge = () => {
                if (!conversation.type) return null;
                const colors = {
                  contact: 'bg-orange-500',
                  bug: 'bg-red-500',
                  feedback: 'bg-cyan-500'
                };
                return (
                  <span className={`${colors[conversation.type]} text-white text-xs px-2 py-1 rounded capitalize`}>
                    {conversation.type}
                  </span>
                );
              };

              return (
                <div
                  key={conversation.id}
                  onClick={() => handleOpenConversation(conversation, conversation.type || 'contact')}
                  className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getTypeIcon()}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-white truncate">{conversation.userName}</h4>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTimestamp(conversation.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs text-gray-400 truncate">{conversation.userEmail}</p>
                          {getTypeBadge()}
                        </div>
                        <p className="text-sm text-gray-300 truncate mt-1">
                          {conversation.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderInbox = (type: 'contact' | 'bug' | 'feedback') => {
    const conversationList = conversations[type] || [];
    const totalUnread = conversationList.reduce((sum, conv) => sum + conv.unreadCount, 0);
    const currentSort = sortBy[type];
    
    const getInboxTitle = () => {
      switch (type) {
        case 'contact': return 'Contact Support Inbox';
        case 'bug': return 'Bug Reports Inbox';
        case 'feedback': return 'Feedback Inbox';
      }
    };

    const getInboxIcon = () => {
      switch (type) {
        case 'contact': return <ContactSupportIcon fontSize="small" className="text-orange-400" />;
        case 'bug': return <BugReportIcon fontSize="small" className="text-red-400" />;
        case 'feedback': return <EmailIcon fontSize="small" className="text-cyan-400" />;
      }
    };

    return (
      <div className="w-[400px] h-[500px] p-4 rounded-lg absolute left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm help-contact-more-sidebar-content">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToMain}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Back to main"
            >
              <ArrowBackIcon fontSize="small" />
            </button>
            <div className="flex items-center gap-2">
              {getInboxIcon()}
              <h2 className="text-lg font-bold">{getInboxTitle()}</h2>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {totalUnread}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Close inbox"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
          <span className="text-sm text-gray-400">
            {conversationList.length} conversation{conversationList.length !== 1 ? 's' : ''}
          </span>
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(type, e.target.value as SortOption)}
              className="bg-gray-700 text-white text-xs px-3 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none appearance-none pr-8"
              title="Sort conversations"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="unread">Unread First</option>
              <option value="name">Name A-Z</option>
            </select>
            <SortIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" fontSize="small" />
          </div>
        </div>

        {/* Conversations List */}
        <div className="space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100% - 120px)' }}>
          {isLoadingConversations ? (
            <div className="text-center py-8 text-gray-400">
              <p>Loading conversations...</p>
            </div>
          ) : conversationList.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="mb-2">{getInboxIcon()}</div>
              <p>No {type} messages yet</p>
            </div>
          ) : (
            conversationList.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleOpenConversation(conversation, type)}
                className="p-3 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <PersonIcon className="text-gray-400 flex-shrink-0" fontSize="small" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white truncate">{conversation.userName}</h4>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTimestamp(conversation.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 truncate">{conversation.userEmail}</p>
                      <p className="text-sm text-gray-300 truncate mt-1">
                        {conversation.lastMessage || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex-shrink-0 ml-2">
                      {conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      {activeView === 'main' && (
        <div className="w-[350px] h-[400px] p-4 rounded-lg absolute left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm help-contact-more-sidebar-content">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <HelpOutlineIcon fontSize="small" />
              {isAdmin ? 'Admin Support Center' : 'Help & Support'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              title="Close help sidebar"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(100% - 80px)' }}>
            {!isAdmin && (
              <>
                {/* Help Section for regular users */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Getting Help</h3>
                  
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left">
                    <KeyboardIcon fontSize="small" className="text-blue-400" />
                    <div>
                      <div className="font-medium">Keyboard Shortcuts</div>
                      <div className="text-xs text-gray-400">View all shortcuts</div>
                    </div>
                  </button>

                  <button 
                    onClick={handleOpenManual}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left"
                  >
                    <InfoIcon fontSize="small" className="text-green-400" />
                    <div>
                      <div className="font-medium">User Guide</div>
                      <div className="text-xs text-gray-400">Learn how to use features</div>
                    </div>
                  </button>

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left">
                    <HelpOutlineIcon fontSize="small" className="text-purple-400" />
                    <div>
                      <div className="font-medium">FAQ</div>
                      <div className="text-xs text-gray-400">Frequently asked questions</div>
                    </div>
                  </button>
                </div>

                {/* Contact Section for regular users */}
                <div className="pt-2 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Contact & Feedback</h3>

                  <button 
                    onClick={() => handleOpenChat('contact')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left"
                  >
                    <ContactSupportIcon fontSize="small" className="text-orange-400" />
                    <div className="flex-1">
                      <div className="font-medium">Contact Support</div>
                      <div className="text-xs text-gray-400">Get help from our team</div>
                    </div>
                    {unreadCounts.contact > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCounts.contact}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => handleOpenChat('bug')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left"
                  >
                    <BugReportIcon fontSize="small" className="text-red-400" />
                    <div className="flex-1">
                      <div className="font-medium">Report Bug</div>
                      <div className="text-xs text-gray-400">Tell us about issues</div>
                    </div>
                    {unreadCounts.bug > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCounts.bug}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => handleOpenChat('feedback')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left"
                  >
                    <EmailIcon fontSize="small" className="text-cyan-400" />
                    <div className="flex-1">
                      <div className="font-medium">Send Feedback</div>
                      <div className="text-xs text-gray-400">Share your thoughts</div>
                    </div>
                    {unreadCounts.feedback > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCounts.feedback}
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={handleOpenUserInbox}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left mt-2 border-t border-gray-700 pt-3"
                  >
                    <InboxIcon fontSize="small" className="text-purple-400" />
                    <div>
                      <div className="font-medium">My Conversations</div>
                      <div className="text-xs text-gray-400">View all your support messages</div>
                    </div>
                  </button>
                </div>

                {/* App Info */}
                <div className="pt-2 border-t border-gray-700">
                  <div className="text-center space-y-1">
                    <div className="text-xs text-gray-400">Notion Clone v1.0.0</div>
                    <div className="text-xs text-gray-500">Made with ❤️ for productivity</div>
                  </div>
                </div>
              </>
            )}

            {isAdmin && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Support Inboxes</h3>

                <button 
                  onClick={() => handleOpenChat('contact')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left"
                >
                  <ContactSupportIcon fontSize="small" className="text-orange-400" />
                  <div className="flex-1">
                    <div className="font-medium">Contact Support Inbox</div>
                    <div className="text-xs text-gray-400">View support requests</div>
                  </div>
                  {unreadCounts.contact > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCounts.contact}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => handleOpenChat('bug')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left"
                >
                  <BugReportIcon fontSize="small" className="text-red-400" />
                  <div className="flex-1">
                    <div className="font-medium">Bug Reports Inbox</div>
                    <div className="text-xs text-gray-400">View bug reports</div>
                  </div>
                  {unreadCounts.bug > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCounts.bug}
                    </span>
                  )}
                </button>

                <button 
                  onClick={() => handleOpenChat('feedback')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left"
                >
                  <EmailIcon fontSize="small" className="text-cyan-400" />
                  <div className="flex-1">
                    <div className="font-medium">Feedback Inbox</div>
                    <div className="text-xs text-gray-400">View user feedback</div>
                  </div>
                  {unreadCounts.feedback > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCounts.feedback}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'contact-inbox' && renderInbox('contact')}
      {activeView === 'bug-inbox' && renderInbox('bug')}
      {activeView === 'feedback-inbox' && renderInbox('feedback')}
      {activeView === 'user-inbox' && renderUserInbox()}

      {activeView === 'manual' && (
        <ManualSidebar
          open={true}
          onClose={handleBackToMain}
        />
      )}

      {activeView === 'chat' && (
        <ChatRoomSidebar
          open={true}
          onClose={isAdmin ? handleBackToInbox : handleBackToMain}
          type={chatType}
          selectedConversation={selectedConversation}
        />
      )}
    </>
  );
};

export default HelpContactMoreSidebar; 