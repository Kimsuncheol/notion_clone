import React, { useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReplyItem from './ReplyItem';

interface Reply {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  timestamp: Date;
}

interface ReplyListProps {
  replies: Reply[];
  parentCommentId: string;
  onDeleteComment: (commentId: string, parentCommentId?: string) => void;
  onEditReply?: (parentCommentId: string, replyId: string, newText: string) => void;
  formatTimestamp: (timestamp: Date) => string;
}

const ReplyList: React.FC<ReplyListProps> = ({
  replies,
  parentCommentId,
  onDeleteComment,
  onEditReply,
  formatTimestamp
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  if (!replies || replies.length === 0) {
    return null;
  }

  return (
    <>
      {/* Fold/Unfold Button */}
      <div className="flex items-center justify-end px-2 pb-2">
        <button
          onClick={toggleExpanded}
          className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors"
          title={isExpanded ? 'Collapse replies' : 'Expand replies'}
        >
          {isExpanded ? (
            <>
              <ExpandLessIcon fontSize="small" />
              Collapse
            </>
          ) : (
            <>
              <ExpandMoreIcon fontSize="small" />
              Expand
            </>
          )}
        </button>
      </div>

      {/* Replies */}
      {isExpanded && (
        <div className="bg-gray-900/30 border-t border-gray-600/30">
          {replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              parentCommentId={parentCommentId}
              onDeleteComment={onDeleteComment}
              onEditReply={onEditReply}
              formatTimestamp={formatTimestamp}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default ReplyList; 