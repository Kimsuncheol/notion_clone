'use client';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { 
  createOrGetSupportConversation, 
  sendSupportMessage, 
  markSupportMessagesAsRead,
  markAdminMessagesAsRead,
  subscribeToConversationUnreadCount,
  getSupportMessagesPaginated,
  subscribeToNewConversationMessages,
  updateAdminPresence,
  checkAdminPresence,
  sendSystemMessage,
  setTypingStatus,
  subscribeToTypingStatus,
  uploadFile,
  type SupportMessage 
} from '@/services/firebase';
import { DocumentSnapshot } from 'firebase/firestore';
import ChatRoomHeader from './ChatRoom/ChatRoomHeader';
import ChatMessageList from './ChatRoom/ChatMessageList';
import ChatInput from './ChatRoom/ChatInput';

const MESSAGE_BATCH_SIZE = 20;

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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [lastMessageDoc, setLastMessageDoc] = useState<DocumentSnapshot | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFileName, setUploadFileName] = useState('');
  const auth = getAuth(firebaseApp);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = auth.currentUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  const scrollToBottom = (behavior: 'smooth' | 'instant' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollThreshold = 100;
      const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + scrollThreshold;
      
      if (isScrolledToBottom) {
        scrollToBottom('smooth');
      }
    }
  }, [messages, typingUsers]);

  const loadMoreMessages = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages || !conversationId) return;

    setIsLoadingMore(true);
    
    const scrollContainer = scrollContainerRef.current;
    const oldScrollHeight = scrollContainer?.scrollHeight || 0;

    try {
      const { messages: newMessages, lastVisible } = await getSupportMessagesPaginated(conversationId, MESSAGE_BATCH_SIZE, lastMessageDoc);
      
      if (newMessages.length > 0) {
        setMessages(prev => [...newMessages.reverse(), ...prev]);
        setLastMessageDoc(lastVisible);
        
        if (scrollContainer) {
          requestAnimationFrame(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight - oldScrollHeight;
          });
        }
      }

      if (newMessages.length < MESSAGE_BATCH_SIZE) {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error("Failed to load more messages:", error);
      toast.error("Could not load older messages.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, isLoadingMore, hasMoreMessages, lastMessageDoc]);

  const handleScroll = () => {
    if (scrollContainerRef.current && scrollContainerRef.current.scrollTop === 0) {
      loadMoreMessages();
    }
  };

  useEffect(() => {
    const initConversation = async () => {
      if (!open || !auth.currentUser) return;

      setIsLoading(true);
      setMessages([]);
      setLastMessageDoc(null);
      setHasMoreMessages(true);

      try {
        let convId: string;
        if (selectedConversation) {
          convId = selectedConversation.id;
          if (isAdmin) {
            await markSupportMessagesAsRead(convId);
            await updateAdminPresence(convId, true);
          }
        } else {
          convId = await createOrGetSupportConversation(type);
          if (!isAdmin) await markAdminMessagesAsRead(convId);
        }
        setConversationId(convId);
        
        const { messages: initialMessages, lastVisible } = await getSupportMessagesPaginated(convId, MESSAGE_BATCH_SIZE);
        setMessages(initialMessages.reverse());
        setLastMessageDoc(lastVisible);
        setHasMoreMessages(initialMessages.length === MESSAGE_BATCH_SIZE);

        setTimeout(() => scrollToBottom('instant'), 0);

      } catch (error) {
        console.error('Error loading conversation:', error);
        toast.error('Failed to load conversation');
      } finally {
        setIsLoading(false);
      }
    };
    initConversation();
  }, [open, type, selectedConversation, auth.currentUser, isAdmin]);

  useEffect(() => {
    if (!conversationId || !open) return;

    const latestMessageTimestamp = messages.length > 0 ? messages[messages.length - 1].timestamp : null;
    
    const unsubscribe = subscribeToNewConversationMessages(conversationId, latestMessageTimestamp, (newMessages) => {
      const container = scrollContainerRef.current;
      const shouldScroll = container ? (container.scrollHeight - container.clientHeight <= container.scrollTop + 20) : false;

      setMessages(prev => [...prev, ...newMessages]);

      if (shouldScroll) {
        setTimeout(() => scrollToBottom('smooth'), 0);
      }
    });

    return () => unsubscribe();
  }, [conversationId, open, messages]);

  useEffect(() => {
    if (!conversationId || !open) return;

    const unsubscribe = subscribeToConversationUnreadCount(
      conversationId,
      isAdmin,
      (count) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`Conversation ${conversationId} unread count:`, count);
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [conversationId, isAdmin, open]);

  useEffect(() => {
    if (!conversationId || !isAdmin) return;

    if (open) {
      updateAdminPresence(conversationId, true);
    }

    return () => {
      if (conversationId) {
        updateAdminPresence(conversationId, false);
      }
    };
  }, [conversationId, isAdmin, open]);

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setConversationId(null);
      setMessage('');
    }
  }, [open]);

  useEffect(() => {
    if (!conversationId || !open || !auth.currentUser) return;

    const unsubscribe = subscribeToTypingStatus(conversationId, (typingEmails) => {
      const otherTypingUsers = typingEmails.filter(email => email !== auth.currentUser?.email);
      setTypingUsers(otherTypingUsers);
    });

    return () => {
      unsubscribe();
      if (conversationId) {
        setTypingStatus(conversationId, false);
      }
    };
  }, [conversationId, open, auth.currentUser]);

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
      await setTypingStatus(conversationId, false);
      
      const sender = isAdmin ? 'admin' : 'user';
      
      await sendSupportMessage(conversationId, message.trim(), sender);
      
      if (!isAdmin) {
        const adminPresent = await checkAdminPresence(conversationId);
        
        if (!adminPresent) {
          setTimeout(async () => {
            try {
              await sendSystemMessage(
                conversationId,
                "They will immediately reply to your message"
              );
            } catch (error) {
              console.error('Error sending auto-reply:', error);
            }
          }, 1000);
        }
      }
      
      setMessage('');
      toast.success('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const onEmojiClick = (emojiData: { emoji: string }) => {
    setMessage(prevMessage => prevMessage + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!auth.currentUser || !conversationId) {
      toast.error("You must be in a conversation to upload files.");
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadFileName(file.name);

    try {
      const downloadUrl = await uploadFile(file, (progress) => {
        if (progress.error) {
          toast.error(`Upload failed: ${progress.error}`);
          setIsUploading(false);
          setUploadProgress(0);
          setUploadFileName('');
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }
        setUploadProgress(progress.progress);
      });

      const fileMessage = `File: [${file.name}](${downloadUrl})`;
      const sender = isAdmin ? 'admin' : 'user';
      await sendSupportMessage(conversationId, fileMessage, sender);

      toast.success("File sent successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleFocus = () => {
    if (conversationId) {
      setTypingStatus(conversationId, true);
    }
  };

  const handleBlur = () => {
    if (conversationId) {
      setTypingStatus(conversationId, false);
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
    <div className="w-[400px] h-[500px] bg-[#262626] p-4 rounded-lg fixed left-60 bottom-4 text-white shadow-xl z-50 text-sm chat-room-sidebar-content flex flex-col">
      <ChatRoomHeader
        title={getTitleByType()}
        userEmail={selectedConversation?.userEmail}
        onClose={onClose}
        icon={getIconByType()}
      />
      
      <ChatMessageList
        messages={messages}
        isLoading={isLoading}
        isLoadingMore={isLoadingMore}
        hasMoreMessages={hasMoreMessages}
        isAdmin={isAdmin}
        typingUsers={typingUsers}
        scrollContainerRef={scrollContainerRef as React.RefObject<HTMLDivElement>}
        messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
        handleScroll={handleScroll}
      />

      <ChatInput
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        handleKeyPress={handleKeyPress}
        handleFocus={handleFocus}
        handleBlur={handleBlur}
        isLoading={isLoading}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        uploadFileName={uploadFileName}
        type={type}
        showEmojiPicker={showEmojiPicker}
        setShowEmojiPicker={setShowEmojiPicker}
        onEmojiClick={onEmojiClick}
        fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
        handleFileSelect={handleFileSelect}
      />
    </div>
  );
};

export default ChatRoomSidebar; 