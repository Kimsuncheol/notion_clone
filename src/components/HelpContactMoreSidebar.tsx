'use client';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import InfoIcon from '@mui/icons-material/Info';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import EmailIcon from '@mui/icons-material/Email';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ManualSidebar from './ManualSidebar';
import ChatRoomSidebar from './ChatRoomSidebar';
import ManualEditor from './ManualEditor';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import {
  getAdminSupportConversations,
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

const HelpContactMoreSidebar: React.FC<Props> = ({ open, onClose }) => {
  type ActiveView = 'main' | 'manual' | 'chat' | 'contact-inbox' | 'bug-inbox' | 'feedback-inbox' | 'manual-editor';
  const [activeView, setActiveView] = useState<ActiveView>('main');
  const [chatType, setChatType] = useState<'contact' | 'bug' | 'feedback'>('contact');
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [conversations, setConversations] = useState<Record<string, ChatConversation[]>>({
    contact: [],
    bug: [],
    feedback: []
  });
  const [sortBy, setSortBy] = useState<Record<string, SortOption>>({
    contact: 'newest',
    bug: 'newest',
    feedback: 'newest'
  });
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
        if (isAdmin) {
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
        }
      } catch (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
      } finally {
        setIsLoadingConversations(false);
      }
    };

    loadConversations();
  }, [isAdmin, activeView, sortBy]);

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
        !target.closest('.manual-editor-content') &&
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

  const handleOpenManual = () => {
    setActiveView('manual');
  };

  const handleOpenManualEditor = () => {
    setActiveView('manual-editor');
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
    } else if (diffInMinutes < 24 * 60) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Render the admin inbox view
  const renderInbox = (type: 'contact' | 'bug' | 'feedback') => {
    const currentSort = sortBy[type];
    const currentConversations = conversations[type];

    const getInboxTitle = () => {
      switch (type) {
        case 'contact': return 'Contact Support Inbox';
        case 'bug': return 'Bug Reports Inbox';
        case 'feedback': return 'Feedback Inbox';
      }
    };

    const getInboxIcon = () => {
      switch (type) {
        case 'contact': return <ContactSupportIcon fontSize="small" />;
        case 'bug': return <BugReportIcon fontSize="small" />;
        case 'feedback': return <EmailIcon fontSize="small" />;
      }
    };

    return (
      <div className="w-[350px] fixed left-60 bottom-4 p-4 rounded-lg bg-[#262626] text-white shadow-lg z-50 text-sm help-contact-more-sidebar-content">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackToMain}
              className="text-gray-400 hover:text-white"
              title="Back to main menu"
            >
              <ArrowBackIcon fontSize="small" />
            </button>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {getInboxIcon()}
              {getInboxTitle()}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            title="Close"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex justify-end mb-2">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(type, e.target.value as SortOption)}
            className="text-xs bg-gray-700 border-gray-600 rounded p-1"
            aria-label="Sort admin conversations"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="unread">Unread first</option>
            <option value="name">By name</option>
          </select>
        </div>

        {/* Conversation List */}
        <div className="overflow-y-auto">
          {isLoadingConversations ? (
            <p>Loading conversations...</p>
          ) : currentConversations.length > 0 ? (
            <div className="space-y-2">
              {currentConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleOpenConversation(conv, type)}
                  className="w-full text-left p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {conv.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-gray-200 truncate">{conv.userName}</h4>
                      <span className="text-xs text-gray-500">{formatTimestamp(conv.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <div className="bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shrink-0">
                      {conv.unreadCount}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400">No conversations in this inbox.</p>
          )}
        </div>
      </div>
    );
  };

  if (!open) return null;

  return (
    <>
      {activeView === 'main' && (
        <div className="w-[350px] h-auto p-4 rounded-lg fixed left-60 bottom-4 bg-[#262626] text-white shadow-lg z-50 text-sm help-contact-more-sidebar-content">
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
              aria-label="Close help sidebar"
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 overflow-y-auto">
            {!isAdmin && (
              <>
                {/* Help Section for regular users */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Getting Help</h3>

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left" title="Keyboard Shortcuts">
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

                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left" title="Frequently Asked Questions">
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
              <>
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

                <div className="pt-2 border-t border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Admin Tools</h3>

                  <button
                    onClick={handleOpenManualEditor}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition-colors text-left"
                  >
                    <EditIcon fontSize="small" className="text-green-400" />
                    <div>
                      <div className="font-medium">Edit User Guide</div>
                      <div className="text-xs text-gray-400">Modify manual content and documentation</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeView === 'contact-inbox' && renderInbox('contact')}
      {activeView === 'bug-inbox' && renderInbox('bug')}
      {activeView === 'feedback-inbox' && renderInbox('feedback')}

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

      {activeView === 'manual-editor' && (
        <ManualEditor
          open={true}
          onClose={handleBackToMain}
        />
      )}
    </>
  );
};

export default HelpContactMoreSidebar; 