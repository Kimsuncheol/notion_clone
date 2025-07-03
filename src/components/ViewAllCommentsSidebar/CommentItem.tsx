import React, { useState } from 'react';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import ReplyForm from './ReplyForm';

interface Reply {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  timestamp: Date;
}

interface CommentItemProps {
  comment: {
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
    comments?: Reply[];
  };
  onAddReply: (parentCommentId: string, text: string) => void;
  onDeleteComment: (commentId: string, parentCommentId?: string) => void;
  formatTimestamp: (timestamp: Date) => string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onAddReply,
  onDeleteComment,
  formatTimestamp
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const auth = getAuth(firebaseApp);

  const canDeleteComment = (authorEmail: string) => {
    return auth.currentUser?.email === authorEmail;
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddReply = (parentCommentId: string, text: string) => {
    onAddReply(parentCommentId, text);
    setShowReplyForm(false);
  };

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-600/50 overflow-hidden group">
      {/* Main Comment */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {comment.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="font-medium text-gray-200 text-sm">
                {comment.author}
              </span>
              <div className="text-xs text-gray-400">
                {formatTimestamp(comment.timestamp)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {canDeleteComment(comment.authorEmail) && (
              <button
                onClick={() => onDeleteComment(comment.id)}
                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded transition-colors"
                title="Delete comment"
              >
                <DeleteIcon fontSize="small" />
              </button>
            )}
          </div>
        </div>
        
        <p className="text-sm text-gray-200 leading-relaxed mb-3">
          {comment.text}
        </p>
        
        {/* Reply Button and Fold/Unfold Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleReplyForm}
              className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <ReplyIcon fontSize="small" />
              Reply
            </button>
            {comment.comments && comment.comments.length > 0 && (
              <span className="text-xs text-gray-500">
                {comment.comments.length} {comment.comments.length === 1 ? 'reply' : 'replies'}
              </span>
            )}
          </div>
          
          {/* Fold/Unfold Button */}
          {comment.comments && comment.comments.length > 0 && (
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
          )}
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <ReplyForm
          commentId={comment.id}
          parentAuthor={comment.author}
          onAddReply={handleAddReply}
          onCancel={() => setShowReplyForm(false)}
        />
      )}

      {/* Replies */}
      {comment.comments && comment.comments.length > 0 && isExpanded && (
        <div className="bg-gray-900/30 border-t border-gray-600/30">
          {comment.comments.map((reply) => (
            <div key={reply.id} className="p-4 border-l-2 border-blue-500/30 ml-6 group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {reply.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-200 text-sm">
                      {reply.author}
                    </span>
                    <div className="text-xs text-gray-400">
                      {formatTimestamp(reply.timestamp)}
                    </div>
                  </div>
                </div>
                {canDeleteComment(reply.authorEmail) && (
                  <button
                    onClick={() => onDeleteComment(reply.id, comment.id)}
                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete reply"
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-300 leading-relaxed ml-11">
                {reply.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem; 