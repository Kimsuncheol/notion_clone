import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';

interface ReplyFormProps {
  commentId: string;
  parentAuthor: string;
  onAddReply: (parentCommentId: string, text: string) => void;
  onCancel: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ 
  commentId, 
  parentAuthor, 
  onAddReply, 
  onCancel 
}) => {
  const [replyText, setReplyText] = useState('');
  const auth = getAuth(firebaseApp);

  const handleAddReply = () => {
    if (!replyText.trim()) return;
    
    onAddReply(commentId, replyText.trim());
    setReplyText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddReply();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="px-4 pb-4">
      <div className="bg-gray-700/50 rounded-lg p-3 border border-gray-600/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-xs text-gray-300">Replying to {parentAuthor}</span>
        </div>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a reply..."
          className="w-full p-2 text-sm border border-gray-600 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={2}
          autoFocus
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">Press Enter to submit, Esc to cancel</span>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 text-xs text-gray-400 hover:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddReply}
              disabled={!replyText.trim()}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyForm; 