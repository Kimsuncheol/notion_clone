import React, { useState } from 'react';
import ReplyIcon from '@mui/icons-material/Reply';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import ReplyForm from './ReplyForm';
import ReplyList from './ReplyList';

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
  onEditReply?: (parentCommentId: string, replyId: string, newText: string) => void;
  formatTimestamp: (timestamp: Date) => string;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onAddReply,
  onDeleteComment,
  onEditReply,
  formatTimestamp
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const auth = getAuth(firebaseApp);

  const canDeleteComment = (authorEmail: string) => {
    return auth.currentUser?.email === authorEmail;
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm);
  };

  const handleAddReply = (parentCommentId: string, text: string) => {
    onAddReply(parentCommentId, text);
    setShowReplyForm(false);
  };

  return (
    <div className={`bg-gray-800/50 overflow-hidden group ${comment.comments && comment.comments.length > 0 ? 'border-b-2 border-blue-500/30' : ''}`}>
      {/* Main Comment */}
      <div className="p-2">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
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

        {/* Reply Button and Reply Count */}
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

      {/* Replies List */}
      <ReplyList
        replies={comment.comments || []}
        parentCommentId={comment.id}
        onDeleteComment={onDeleteComment}
        onEditReply={onEditReply}
        formatTimestamp={formatTimestamp}
      />
    </div>
  );
};

export default CommentItem; 
