'use client';
import React, { useEffect, useState } from 'react';
import { useModalStore } from '@/store/modalStore';
import { Comment } from '@/types/comments';
import CloseIcon from '@mui/icons-material/Close';
import CommentIcon from '@mui/icons-material/Comment';

interface Props {
  open: boolean;
  onClose: () => void;
  blockComments: Record<string, Comment[]>;
  getBlockTitle?: (blockId: string) => string;
}

const ViewAllCommentsModal: React.FC<Props> = ({ 
  open, 
  onClose, 
  blockComments,
  getBlockTitle 
}) => {
  const { setShowViewAllComments } = useModalStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComments, setFilteredComments] = useState<Array<{ blockId: string; comment: Comment; blockTitle: string }>>([]);

  // Flatten all comments from all blocks
  const allComments = React.useMemo(() => {
    const comments: Array<{ blockId: string; comment: Comment; blockTitle: string }> = [];
    
    Object.entries(blockComments).forEach(([blockId, blockCommentList]) => {
      blockCommentList.forEach((comment) => {
        comments.push({
          blockId,
          comment,
          blockTitle: getBlockTitle ? getBlockTitle(blockId) : `Block ${blockId.slice(0, 8)}...`
        });
      });
    });
    
    // Sort by timestamp (newest first)
    return comments.sort((a, b) => b.comment.timestamp.getTime() - a.comment.timestamp.getTime());
  }, [blockComments, getBlockTitle]);

  // Filter comments based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredComments(allComments);
      return;
    }

    const filtered = allComments.filter(({ comment, blockTitle }) => 
      comment.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blockTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredComments(filtered);
  }, [searchTerm, allComments]);

  // Click-outside detection to close modal
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.view-all-comments-modal-content')) {
        setShowViewAllComments(false);
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, setShowViewAllComments, onClose]);

  // Handle Escape key to close modal
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

  if (!open) return null;

  const totalComments = allComments.length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-[color:var(--background)] text-[color:var(--foreground)] rounded-lg shadow-2xl w-full max-w-4xl p-6 relative max-h-[90vh] overflow-hidden view-all-comments-modal-content">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <CommentIcon className="text-blue-600" />
            All Comments
          </h2>
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full font-medium">
              {totalComments} comment{totalComments !== 1 ? 's' : ''}
            </span>
            <button
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
              onClick={handleClose}
              aria-label="Close comments"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CommentIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search comments, authors, or blocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {filteredComments.length === 0 ? (
            <div className="text-center py-12">
              {totalComments === 0 ? (
                <>
                  <div className="text-6xl mb-4">💭</div>
                  <h3 className="text-xl font-semibold mb-2">No comments yet</h3>
                  <p className="text-gray-500">Comments will appear here when they&apos;re added to blocks</p>
                </>
              ) : (
                <>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No matching comments</h3>
                  <p className="text-gray-500">Try adjusting your search terms</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComments.map(({ blockId, comment, blockTitle }) => (
                <div 
                  key={`${blockId}-${comment.id}`} 
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Block Info */}
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded flex items-center justify-center text-white text-xs font-medium">
                      📝
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {blockTitle}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-3">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>

                  {/* Comment Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          {comment.author}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {comment.timestamp.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {totalComments > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 text-center">
              💡 <strong>Tip:</strong> Comments are organized by most recent first. Use the search bar to find specific comments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllCommentsModal; 