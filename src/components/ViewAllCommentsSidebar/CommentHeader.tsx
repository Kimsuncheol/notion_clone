import React from 'react';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';
import { IconButton } from '@mui/material';

interface CommentHeaderProps {
  totalCommentsCount: number;
  onClose: () => void;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({ totalCommentsCount, onClose }) => {
  return (
    <div className="flex items-center justify-between p-2 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <div className="p-1 bg-blue-500/20 rounded-lg">
          <CommentIcon className="text-blue-400" fontSize='small' />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-100">All Comments</p>
          <p className="text-xs text-gray-400">Discussion and feedback</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="bg-blue-900/50 text-blue-200 text-xs px-3 py-1 rounded-full font-medium">
          {totalCommentsCount} total
        </span>
        <IconButton
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
          onClick={onClose}
          aria-label="Close comments"
        >
          <CloseIcon sx={{ fontSize: '16px' }} />
        </IconButton>
      </div>
    </div>
  );
};

export default CommentHeader; 