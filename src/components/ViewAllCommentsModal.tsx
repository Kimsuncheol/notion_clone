'use client';
import React, { useEffect, useState } from 'react';
import { useModalStore } from '@/store/modalStore';
import { useColorStore } from '@/store/colorStore';
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
  const backgroundColor = useColorStore(state => state.backgroundColor);

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

  if (!open) return null;

  const totalComments = allComments.length;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/20" />
      
      {/* Right Sidebar */}
      <div 
        className={`fixed top-[45px] no-scrollbar right-0 z-50 w-96 h-auto text-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        } view-all-comments-sidebar-content`}
        style={{ backgroundColor }}
      >
        <div className="flex flex-col h-full">
        {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CommentIcon className="text-blue-400" />
            All Comments
          </h2>
          <div className="flex items-center gap-3">
              <span className="bg-blue-900/50 text-blue-200 text-xs px-2 py-1 rounded-full font-medium">
              {totalComments} comment{totalComments !== 1 ? 's' : ''}
            </span>
            <button
                className="text-gray-400 hover:text-gray-200 p-1 transition-colors"
              onClick={handleClose}
              aria-label="Close comments"
            >
              <CloseIcon />
            </button>
          </div>
        </div>

        {/* Search Bar */}
          <div className="p-4">
            <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <CommentIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search comments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-800 text-sm text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
            </div>
        </div>

        {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-10">
              {totalComments === 0 ? (
                <>
                  <div className="text-5xl mb-3">💭</div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-200">No comments yet</h3>
                    <p className="text-sm text-gray-400">Comments will appear here when added</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-3">🔍</div>
                    <h3 className="text-lg font-semibold mb-1 text-gray-200">No matching comments</h3>
                    <p className="text-sm text-gray-400">Try adjusting your search</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredComments.map(({ blockId, comment, blockTitle }) => (
                <div 
                  key={`${blockId}-${comment.id}`} 
                    className="bg-gray-800 rounded-lg border border-gray-600 p-3 hover:bg-gray-750 transition-colors"
                >
                  {/* Block Info */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-600">
                    <div className="w-5 h-5 bg-gradient-to-br from-purple-400 to-pink-500 rounded flex items-center justify-center text-white text-xs font-medium">
                      📝
                    </div>
                      <span className="text-xs text-gray-300 font-medium">
                      {blockTitle}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <div className="mb-2">
                      <p className="text-sm text-gray-200 leading-normal">
                      {comment.text}
                    </p>
                  </div>

                  {/* Comment Meta */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div>
                          <span className="font-medium text-gray-200 text-xs">
                          {comment.author}
                        </span>
                      </div>
                    </div>
                      <div className="text-xs text-gray-400">
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
            <div className="p-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center">
              💡 <strong>Tip:</strong> Comments are organized by most recent first.
            </p>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ViewAllCommentsModal; 