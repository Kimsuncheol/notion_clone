'use client';
import React, { useEffect, useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { 
  createOrGetSupportConversation, 
  sendSupportMessage, 
  getSupportMessages, 
  markSupportMessagesAsRead,
  type SupportMessage 
} from '@/services/firebase';

interface ChatConversation {
  id: string;
  userEmail: string;
  userName: string;
  lastMessage: string;
  timestamp: Date;
  unreadCount: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  type: 'contact' | 'bug' | 'feedback';
  selectedConversation?: ChatConversation | null;
}

const ChatRoomSidebar: React.FC<Props> = ({ open, onClose, type, selectedConversation }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const auth = getAuth(firebaseApp);

  // Check if current user is admin
  const isAdmin = auth.currentUser?.email === 'cheonjae6@naver.com';

  // Load conversation and messages when component opens
  useEffect(() => {
    const loadConversation = async () => {
      if (!open || !auth.currentUser) return;

      try {
        setIsLoading(true);
        let convId: string;

        if (selectedConversation) {
          // Admin viewing a specific conversation
          convId = selectedConversation.id;
          // Mark messages as read when admin opens conversation
          if (isAdmin) {
            await markSupportMessagesAsRead(convId);
          }
        } else {
          // User creating/opening their own conversation
          convId = await createOrGetSupportConversation(type);
        }

        setConversationId(convId);
        
        // Load messages
        const supportMessages = await getSupportMessages(convId);
        setMessages(supportMessages);
      } catch (error) {
        console.error('Error loading conversation:', error);
        toast.error('Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [open, type, selectedConversation, auth.currentUser, isAdmin]);

  // Reset state when closing
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setConversationId(null);
      setMessage('');
    }
  }, [open]);

  const getTitleByType = () => {
    if (selectedConversation) {
      return `${type.charAt(0).toUpperCase() + type.slice(1)} - ${selectedConversation.userName}`;
    }
    
    switch (type) {
      case 'contact':
        return 'Contact Support';
      case 'bug':
        return 'Report Bug';
      case 'feedback':
        return 'Send Feedback';
      default:
        return 'Chat';
    }
  };

  const getIconByType = () => {
    switch (type) {
      case 'contact':
        return '🆘';
      case 'bug':
        return '🐛';
      case 'feedback':
        return '💬';
      default:
        return '💬';
    }
  };

  // Click outside to close sidebar
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.chat-room-sidebar-content') && !target.closest('.help-contact-more-sidebar-content')) {
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
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, onClose]);

  const handleSendMessage = async () => {
    if (!message.trim() || !auth.currentUser || !conversationId) {
      return;
    }

    setIsLoading(true);
    try {
      const sender = isAdmin ? 'admin' : 'user';
      
      // Send message to Firebase
      await sendSupportMessage(conversationId, message.trim(), sender);
      
      // Reload messages to get the latest
      const updatedMessages = await getSupportMessages(conversationId);
      setMessages(updatedMessages);
      
      setMessage('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  if (!open) return null;

  return (
    <div className="w-[400px] h-[500px] bg-[#262626] p-4 rounded-lg absolute left-60 bottom-4 text-white shadow-xl z-50 text-sm chat-room-sidebar-content flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getIconByType()}</span>
          <div>
            <h2 className="font-bold text-base">{getTitleByType()}</h2>
            {selectedConversation ? (
              <p className="text-xs text-gray-400">From: {selectedConversation.userEmail}</p>
            ) : (
              <p className="text-xs text-gray-400">To: cheonjae6@naver.com</p>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1"
          title="Close chat"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>

      <hr className="border-gray-600 mb-4" />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
        {isLoading ? (
          <div className="text-center text-gray-400 py-8">
            <Typography variant="body2">Loading conversation...</Typography>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <Typography variant="body2">
              Start a conversation with our support team
            </Typography>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === (isAdmin ? 'admin' : 'user') ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.sender === (isAdmin ? 'admin' : 'user')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-medium">
                    {msg.sender === 'admin' ? 'Support Team' : msg.senderName}
                  </p>
                  <p className="text-xs opacity-70">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-600 pt-3">
        <div className="flex items-center gap-2">
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Type your ${type} message...`}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                backgroundColor: '#374151',
                color: 'white',
                fontSize: '14px',
                '& fieldset': {
                  borderColor: '#6B7280',
                },
                '&:hover fieldset': {
                  borderColor: '#9CA3AF',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#3B82F6',
                },
              },
              '& .MuiInputBase-input': {
                color: 'white',
                fontSize: '14px',
                '&::placeholder': {
                  color: '#9CA3AF',
                  opacity: 1,
                },
              },
            }}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || isLoading}
            variant="contained"
            sx={{
              minWidth: '44px',
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#3B82F6',
              '&:hover': {
                backgroundColor: '#2563EB',
              },
              '&:disabled': {
                backgroundColor: '#6B7280',
              },
            }}
          >
            <SendIcon fontSize="small" />
          </Button>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatRoomSidebar; 