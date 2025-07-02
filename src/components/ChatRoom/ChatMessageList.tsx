'use client';
import React from 'react';
import { Typography } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { SupportMessage } from '@/services/firebase';

interface ChatMessageListProps {
  messages: SupportMessage[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  isAdmin: boolean;
  typingUsers: string[];
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleScroll: () => void;
}

const isSingleEmoji = (text: string) => {
  const emojiRegex = /^\p{Emoji}$/u;
  return emojiRegex.test(text.trim());
};

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isLoading,
  isLoadingMore,
  hasMoreMessages,
  isAdmin,
  typingUsers,
  scrollContainerRef,
  messagesEndRef,
  handleScroll,
}) => {
  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0 snap-none no-scrollbar"
    >
      {isLoadingMore ? (
        <div className="text-center text-gray-400 py-4">
          <Typography variant="body2">Loading older messages...</Typography>
        </div>
      ) : !hasMoreMessages && messages.length > 0 ? (
        <div className="text-center text-gray-400 text-xs py-4">
          <p>You&apos;ve reached the beginning of the conversation.</p>
        </div>
      ) : null}
      
      {messages.length === 0 && !isLoading && !isLoadingMore ? (
        <div className="text-center text-gray-400 py-8">
          <Typography variant="body2">Start a conversation with our support team</Typography>
        </div>
      ) : (
        messages
          .filter(msg => !(isAdmin && msg.sender === 'system'))
          .map((msg) => {
            const singleEmoji = isSingleEmoji(msg.text);
            return (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === 'system'
                    ? 'justify-start'
                    : msg.sender === (isAdmin ? 'admin' : 'user')
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.sender === 'system'
                      ? 'bg-gray-600 text-gray-200 text-center italic max-w-[90%]'
                      : msg.sender === (isAdmin ? 'admin' : 'user')
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {msg.sender !== 'system' && (
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium">
                        {msg.sender === 'admin' ? 'Support Team' : msg.senderName}
                      </p>
                      <p className="text-xs opacity-70">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                  <div className={`${singleEmoji ? 'text-7xl flex items-center justify-center p-4' : 'text-sm'} ${msg.sender === 'system' ? 'text-xs' : ''}`}>
                    <ReactMarkdown
                      components={{
                        a: ({...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline"/>
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                  {msg.sender === 'system' && (
                    <p className="text-xs opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            )
          })
      )}
      {typingUsers.length > 0 && (
        <div className="flex justify-start">
          <div className="bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList; 