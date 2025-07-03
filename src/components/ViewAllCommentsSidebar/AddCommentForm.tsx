import React, { useState } from 'react';
import SendIcon from '@mui/icons-material/Send';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';

interface AddCommentFormProps {
  onAddComment?: (text: string) => void;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({ onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const auth = getAuth(firebaseApp);

  const handleAddComment = () => {
    if (!newComment.trim() || !onAddComment) return;
    
    onAddComment(newComment.trim());
    setNewComment('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (!auth.currentUser || !onAddComment) return null;

  return (
    <div className="border-t border-gray-700 bg-gray-800/30" id="add-comment-section">
      <div className="bg-gray-800/50 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {auth.currentUser.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-sm font-medium text-gray-200">Add a comment</span>
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Share your thoughts on this note..."
          className="w-full p-3 text-sm border border-gray-600 rounded-lg bg-gray-700 text-gray-200 placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          rows={3}
        />
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-400">
            Press Enter to submit, Shift+Enter for new line
          </span>
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-sm flex items-center gap-2"
          >
            <SendIcon fontSize="small" />
            Comment
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCommentForm; 