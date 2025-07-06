import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { ArrowUpward } from '@mui/icons-material';
import CloseIcon from '@mui/icons-material/Close';

interface ReplyFormProps {
  commentId: string;
  parentAuthor: string;
  onAddReply: (parentCommentId: string, text: string) => void;
  onCancel: () => void;
  initialText?: string;
  isEditing?: boolean;
}

const ReplyForm: React.FC<ReplyFormProps> = ({
  commentId,
  parentAuthor,
  onAddReply,
  onCancel,
  initialText = '',
  isEditing = false
}) => {
  const [replyText, setReplyText] = useState(initialText);
  const [rows, setRows] = useState(2);
  const auth = getAuth(firebaseApp);

  // Update replyText when initialText changes (for editing)
  useEffect(() => {
    setReplyText(initialText);
  }, [initialText]);

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
    if (e.key === 'Escape' && e.shiftKey) {
      onCancel();
    }
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setRows(prev => prev + 1);
    }
    if (e.key === 'Backspace' && e.shiftKey && rows > 2) {
      e.preventDefault();
      setRows(prev => prev - 1);
    }
  };

  return (
    <div className="">
      <div className="bg-gray-700/50 rounded-lg p-2 border-gray-600/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {auth.currentUser?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-xs text-gray-300">
            {isEditing ? `Editing reply` : `Replying to ${parentAuthor}`}
          </span>
        </div>
        <div className='relative w-full border border-gray-700 rounded-lg'>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isEditing ? "Edit your reply..." : "Write a reply..."}
            className="w-full p-2 text-sm border border-gray-600 rounded-lg bg-gray-800 text-gray-200 placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            rows={rows}
            autoFocus
          />
          <div className="absolute right-2 bottom-4 flex gap-2 items-center">
            <div
              onClick={onCancel}
              className="px-2 py-1 text-sm bg-gray-700/50 rounded-full text-gray-400 hover:text-gray-300 transition-colors"
            >
              <CloseIcon fontSize='inherit' />
            </div>
            <div
              onClick={handleAddReply}
              className={`px-2 py-1 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${!replyText.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
                }`}
            >
              <ArrowUpward fontSize='inherit' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplyForm; 