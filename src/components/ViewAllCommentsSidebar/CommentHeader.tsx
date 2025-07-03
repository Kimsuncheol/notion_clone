import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';

interface CommentHeaderProps {
  totalCommentsCount: number;
  onClose: () => void;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({ totalCommentsCount, onClose }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <CommentIcon className="text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-100">All Comments</h2>
          <p className="text-sm text-gray-400">Discussion and feedback</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-blue-900/50 text-blue-200 text-xs px-3 py-1 rounded-full font-medium">
          {totalCommentsCount} total
        </span>
        <button
          className="text-gray-400 hover:text-gray-200 p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          onClick={onClose}
          aria-label="Close comments"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};

export default CommentHeader; 