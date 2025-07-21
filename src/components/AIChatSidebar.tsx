import React, { useState, useRef, useEffect } from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import MinimizeIcon from '@mui/icons-material/Minimize';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatSidebarProps {
  onClose?: () => void;
  isOpen?: boolean;
}

const AIChatSidebar: React.FC<AIChatSidebarProps> = ({ onClose, isOpen = false }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m Claude, your AI assistant. How can I help you with your notes today?',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: userMessage.content,
          history: messages.slice(-10) // Send last 10 messages for context
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const { content } = await response.json();
      
      const assistantMessage: Message = {
        role: 'assistant',
        content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    // Don't change the current class name if not necessary
    <div className={`fixed right-4 bottom-4 bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
      isMinimized ? 'w-100 h-12' : 'w-100 h-96'
    }`} style={{ zIndex: 1000 }}>
      {/* Header */}
      <div className={`flex items-center justify-between px-2 py-1 border-b border-gray-200 dark:border-gray-700 text-black dark:text-white dark:bg-black/90 backdrop-blur-sm bg-white/90 rounded-t-xl ${
        isMinimized && 'rounded-b-xl' 
      }`}>
        <div className="flex items-center gap-2">
          <SmartToyIcon fontSize="small" />
          <h3 className="text-sm font-semibold">Claude AI Assistant</h3>
        </div>
        <div className="flex items-center gap-1">
          <IconButton 
            onClick={() => setIsMinimized(!isMinimized)} 
            size="small"
            sx={{
              color: 'white',
            }}
          >
            <MinimizeIcon fontSize="small" />
          </IconButton>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{
              color: 'white',
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 h-64">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-lg px-2 py-1 ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] ${
                    msg.role === 'user' ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2 items-center">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-700/80 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                disabled={isLoading}
              />
              <IconButton 
                onClick={sendMessage} 
                disabled={!message.trim() || isLoading}
                sx={{
                  backgroundColor: 'blue',
                  '&:hover': {
                    backgroundColor: 'skyblue',
                    color: 'white',
                  },
                }}
              >
                <SendIcon fontSize="small" className="text-white" />
              </IconButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChatSidebar; 