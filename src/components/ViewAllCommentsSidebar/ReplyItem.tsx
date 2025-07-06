import React, { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
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

interface ReplyItemProps {
  reply: Reply;
  parentCommentId: string;
  onDeleteComment: (commentId: string, parentCommentId?: string) => void;
  onEditReply?: (parentCommentId: string, replyId: string, newText: string) => void;
  formatTimestamp: (timestamp: Date) => string;
}

const ReplyItem: React.FC<ReplyItemProps> = ({
  reply,
  parentCommentId,
  onDeleteComment,
  onEditReply,
  formatTimestamp
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const auth = getAuth(firebaseApp);

  const canDeleteComment = (authorEmail: string) => {
    return auth.currentUser?.email === authorEmail;
  };

  const handleEditReply = (replyId: string, newText: string) => {
    if (onEditReply) {
      onEditReply(parentCommentId, replyId, newText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  return (
    <div className="p-2 border-l-2 border-blue-500/30 ml-6 group">
      {!isEditing ? (
        <>
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
                onClick={() => onDeleteComment(reply.id, parentCommentId)}
                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete reply"
              >
                <DeleteIcon fontSize="small" />
              </button>
            )}
          </div>
          <div className='ml-11 flex items-center justify-between'>
            <p className="text-sm text-gray-300 leading-relaxed">
              {reply.text}
            </p>
            {canDeleteComment(reply.authorEmail) && (
              <button
                onClick={() => setIsEditing(true)}
                className='text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 transition-colors'>
                Edit
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="">
          <ReplyForm
            commentId={parentCommentId}
            parentAuthor={reply.author}
            initialText={reply.text}
            isEditing={true}
            onAddReply={(parentId, text) => handleEditReply(reply.id, text)}
            onCancel={handleCancelEdit}
          />
        </div>
      )}
    </div>
  );
};

export default ReplyItem; 