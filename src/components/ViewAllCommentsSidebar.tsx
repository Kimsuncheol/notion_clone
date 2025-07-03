'use client';
import React, { useEffect } from 'react';
import { useModalStore } from '@/store/modalStore';
import { useColorStore } from '@/store/colorStore';
import { Comment } from '@/types/comments';
import CommentIcon from '@mui/icons-material/Comment';
import { CommentHeader, AddCommentForm, CommentItem } from './ViewAllCommentsSidebar/';

interface NestedComment {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  timestamp: Date;
  comments?: Array<{
    id: string;
    text: string;
    author: string;
    authorEmail: string;
    timestamp: Date;
  }>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  blockComments: Record<string, Comment[]>;
  noteComments?: NestedComment[];
  getBlockTitle?: (blockId: string) => string;
  onAddComment?: (text: string) => void;
  onAddReply?: (parentCommentId: string, text: string) => void;
  onDeleteComment?: (commentId: string, parentCommentId?: string) => void;
}

const ViewAllCommentsSidebar: React.FC<Props> = ({ 
  open, 
  onClose, 
  blockComments,
  noteComments = [],
  getBlockTitle,
  onAddComment,
  onAddReply,
  onDeleteComment
}) => {
  const { setShowViewAllComments } = useModalStore();
  const backgroundColor = useColorStore(state => state.backgroundColor);

  // Flatten all comments from all blocks for display
  const allBlockComments = React.useMemo(() => {
    const comments: Array<{ 
      blockId: string; 
      comment: Comment; 
      blockTitle: string;
    }> = [];
    
    // Add block-level comments
    Object.entries(blockComments).forEach(([blockId, blockCommentList]) => {
      blockCommentList.forEach((comment) => {
        comments.push({
          blockId,
          comment,
          blockTitle: getBlockTitle ? getBlockTitle(blockId) : `Block ${blockId.slice(0, 8)}...`,
        });
      });
    });
    
    // Sort by timestamp (newest first)
    return comments.sort((a, b) => b.comment.timestamp.getTime() - a.comment.timestamp.getTime());
  }, [blockComments, getBlockTitle]);

  // Calculate total comments including replies
  const totalCommentsCount = React.useMemo(() => {
    const blockCommentsCount = Object.values(blockComments).reduce((total, comments) => total + comments.length, 0);
    const noteCommentsCount = noteComments.reduce((total, comment) => {
      return total + 1 + (comment.comments?.length || 0);
    }, 0);
    return blockCommentsCount + noteCommentsCount;
  }, [blockComments, noteComments]);

  // Click-outside detection to close sidebar
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.view-all-comments-sidebar-content')) {
        setShowViewAllComments(false);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setShowViewAllComments, onClose]);

  // Handle Escape key to close sidebar
  useEffect(() => {
    if (!open) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowViewAllComments(false);
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [open, setShowViewAllComments, onClose]);

  const handleClose = () => {
    setShowViewAllComments(false);
    onClose();
  };

  const formatTimestamp = (timestamp: Date) => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Just now';
    }
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" />
      
      {/* Right Sidebar */}
      <div 
        className={`fixed top-[45px] no-scrollbar right-0 z-50 w-[420px] h-[calc(100vh-45px)] text-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } view-all-comments-sidebar-content`}
        style={{ backgroundColor }}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <CommentHeader
            totalCommentsCount={totalCommentsCount}
            onClose={handleClose}
          />

          {/* Comments List - Now comes first */}
          <div className="flex-1 overflow-y-auto" id="comments-list">
            {allBlockComments.length === 0 && noteComments.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💭</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-200">No comments yet</h3>
                <p className="text-sm text-gray-400">Start the conversation by leaving a comment</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Note Comments Section */}
                {noteComments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CommentIcon className="text-green-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200">Note Comments</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {noteComments.map((comment) => (
                        <CommentItem
                          key={comment.id}
                          comment={comment}
                          onAddReply={onAddReply || (() => {})}
                          onDeleteComment={onDeleteComment || (() => {})}
                          formatTimestamp={formatTimestamp}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Block Comments Section */}
                {allBlockComments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <CommentIcon className="text-purple-400 text-lg" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-200">Block Comments</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {allBlockComments.map(({ blockId, comment, blockTitle }) => (
                        <div key={`${blockId}-${comment.id}`} className="bg-gray-800/50 rounded-xl border border-gray-600/50 p-4">
                          {/* Block Info */}
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-600/50">
                            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded flex items-center justify-center text-white text-xs font-medium">
                              📝
                            </div>
                            <span className="text-xs text-gray-300 font-medium">
                              {blockTitle}
                            </span>
                          </div>

                          {/* Comment Content */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
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
                          </div>
                          
                          <p className="text-sm text-gray-200 leading-relaxed ml-11">
                            {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Comment Form - Now comes at the bottom */}
          <AddCommentForm onAddComment={onAddComment} />

          {/* Footer */}
          {totalCommentsCount > 0 && (
            <div className="p-6 border-t border-gray-700 bg-gray-800/30">
              <p className="text-xs text-gray-400 text-center">
                💡 <strong>Tip:</strong> Comments are organized by most recent first. You can reply to note comments to start a discussion.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewAllCommentsSidebar; 