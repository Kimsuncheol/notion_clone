'use client';
import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface ChatRoomHeaderProps {
  title: string;
  userEmail?: string;
  onClose: () => void;
  icon: string;
}

const ChatRoomHeader: React.FC<ChatRoomHeaderProps> = ({ title, userEmail, onClose, icon }) => {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <div>
            <h2 className="font-bold text-base">{title}</h2>
            {userEmail ? (
              <p className="text-xs text-gray-400">From: {userEmail}</p>
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
    </>
  );
};

export default ChatRoomHeader; 