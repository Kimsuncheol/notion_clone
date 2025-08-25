import React, { useState } from 'react';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { ArrowUpward } from '@mui/icons-material';
import { grayColor2 } from '@/constants/color';

interface AddCommentFormProps {
  onAddComment?: (text: string) => void;
}

const AddCommentForm: React.FC<AddCommentFormProps> = ({ onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [rows, setRows] = useState(3);
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
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      setRows(rows + 1);
    } else if (e.key === 'Backspace' && e.shiftKey && rows > 3) {
      e.preventDefault();
      setRows(prev => prev - 1);
    } 
  };

  if (!auth.currentUser || !onAddComment) return null;

  return (
    <div className="border-t border-gray-700" id="add-comment-section" style={{ backgroundColor: grayColor2 }}>
      <div className="rounded-xl px-2 py-4">
        <div className='relative w-full border border-gray-700 rounded-lg' style={{ backgroundColor: grayColor2 }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share your thoughts on this note..."
            className="w-[calc(100%-2rem)] p-3 text-sm text-gray-200  resize-none transition-all focus:outline-none"
            rows={rows}
          />
          <div
            onClick={handleAddComment}
            className={`absolute right-2 bottom-2 px-2 py-1 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold shadow-sm cursor-pointer ${
              !newComment.trim() ? 'opacity-50 cursor-not-allowed' : 'opacity-100 cursor-pointer'
            }`}
          >
            <ArrowUpward fontSize='inherit' />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCommentForm; 