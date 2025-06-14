'use client';
import React, { useState, useRef, useEffect } from 'react';
import { BlockType } from '@/types/blocks';
import { Comment } from '@/types/comments';

interface BlockHoverMenuProps {
  blockId: string;
  blockType: BlockType;
  isVisible: boolean;
  position: { x: number; y: number };
  onConvertBlock: (blockId: string, newType: BlockType) => void;
  onConvertStyled: (blockId: string, className: string) => void;
  comments: Comment[];
  onAddComment: (blockId: string, text: string) => void;
  onDeleteComment: (blockId: string, commentId: string) => void;
}

const BlockHoverMenu: React.FC<BlockHoverMenuProps> = ({
  blockId,
  isVisible,
  position,
  onConvertBlock,
  onConvertStyled,
  comments,
  onAddComment,
  onDeleteComment,
}) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showTextSubmenu, setShowTextSubmenu] = useState(false);
  const [showCommentWidget, setShowCommentWidget] = useState(false);
  const [newComment, setNewComment] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const commentWidgetRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowBlockMenu(false);
        setShowTextSubmenu(false);
      }
      if (commentWidgetRef.current && !commentWidgetRef.current.contains(event.target as Node)) {
        setShowCommentWidget(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset states when menu becomes invisible
  useEffect(() => {
    if (!isVisible) {
      setShowBlockMenu(false);
      setShowTextSubmenu(false);
      setShowCommentWidget(false);
    }
  }, [isVisible]);

  const handleBlockConvert = (newType: BlockType) => {
    onConvertBlock(blockId, newType);
    setShowBlockMenu(false);
    setShowTextSubmenu(false);
  };

  const handleStyledConvert = (className: string) => {
    onConvertStyled(blockId, className);
    setShowBlockMenu(false);
    setShowTextSubmenu(false);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(blockId, newComment.trim());
      setNewComment('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (!isVisible) return null;

  const blockMenuItems = [
    { type: 'text' as BlockType, icon: '📝', label: 'Text', hasSubmenu: true },
    { type: 'list' as BlockType, icon: '•', label: 'Bullet List' },
    { type: 'orderedlist' as BlockType, icon: '1.', label: 'Ordered List' },
    { type: 'table' as BlockType, icon: '⊞', label: 'Table' },
    { type: 'image' as BlockType, icon: '🖼️', label: 'Image' },
    { type: 'chart' as BlockType, icon: '📊', label: 'Chart' },
    { type: 'pdf' as BlockType, icon: '📄', label: 'PDF' },
  ];

  const textSubmenuItems = [
    { className: 'text-4xl', label: 'Heading 1', shortcut: '/h1' },
    { className: 'text-3xl', label: 'Heading 2', shortcut: '/h2' },
    { className: 'text-2xl', label: 'Heading 3', shortcut: '/h3' },
    { className: 'text-xl', label: 'Heading 4', shortcut: '/h4' },
    { className: 'text-lg', label: 'Heading 5', shortcut: '/h5' },
    { className: 'font-bold', label: 'Bold', shortcut: '/b' },
    { className: 'text-4xl font-bold', label: 'Bold Heading 1', shortcut: '/bh1' },
    { className: 'text-3xl font-bold', label: 'Bold Heading 2', shortcut: '/bh2' },
    { className: 'text-2xl font-bold', label: 'Bold Heading 3', shortcut: '/bh3' },
    { className: 'text-xl font-bold', label: 'Bold Heading 4', shortcut: '/bh4' },
    { className: 'text-lg font-bold', label: 'Bold Heading 5', shortcut: '/bh5' },
    { className: 'text-4xl italic', label: 'Italic Heading 1', shortcut: '/ih1' },
    { className: 'text-3xl italic', label: 'Italic Heading 2', shortcut: '/ih2' },
    { className: 'text-2xl italic', label: 'Italic Heading 3', shortcut: '/ih3' },
    { className: 'text-xl italic', label: 'Italic Heading 4', shortcut: '/ih4' },
    { className: 'text-lg italic', label: 'Italic Heading 5', shortcut: '/ih5' },
  ];

  return (
    <>
      {/* Invisible bridge to prevent menu from disappearing */}
      <div
        className="fixed z-40"
        style={{
          left: position.x - 70,
          top: position.y - 5,
          width: 80,
          height: 50,
        }}
      />
      
      <div
        className="fixed z-50 flex items-center gap-1"
        style={{
          left: position.x - 60,
          top: position.y,
        }}
      >
      {/* Block Menu Icon */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => {
            setShowBlockMenu(!showBlockMenu);
            setShowCommentWidget(false);
          }}
          className="px-[2px] py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 transition-colors"
          title="Block menu"
        >
          ⊞
        </button>

        {/* Block Menu Dropdown */}
        {showBlockMenu && (
          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg py-1 min-w-48 z-60">
            {blockMenuItems.map((item) => (
              <div key={item.type} className="relative">
                <button
                  onClick={() => {
                    if (item.hasSubmenu && item.type === 'text') {
                      setShowTextSubmenu(!showTextSubmenu);
                    } else {
                      handleBlockConvert(item.type);
                    }
                  }}
                  onMouseEnter={() => {
                    if (item.hasSubmenu && item.type === 'text') {
                      setShowTextSubmenu(true);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                  {item.hasSubmenu && <span className="ml-auto text-xs">▶</span>}
                </button>

                {/* Text Submenu */}
                {item.type === 'text' && showTextSubmenu && (
                  <div className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg py-1 min-w-56 z-70">
                    {textSubmenuItems.map((subItem, index) => (
                      <button
                        key={index}
                        onClick={() => handleStyledConvert(subItem.className)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                      >
                        <span className="text-sm">{subItem.label}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{subItem.shortcut}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment Icon */}
      <div className="relative">
        <button
          onClick={() => {
            setShowCommentWidget(!showCommentWidget);
            setShowBlockMenu(false);
          }}
          className="p-1 text-sm border-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full border border-gray-300 dark:border-gray-600 transition-colors relative"
          title="Comments"
        >
          💬
          {comments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {comments.length}
            </span>
          )}
        </button>

        {/* Comment Widget */}
        {showCommentWidget && (
          <div
            ref={commentWidgetRef}
            className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg p-1 w-80 z-60"
          >
            <div className="max-h-60 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 p-2">No comments yet</p>
              ) : (
                <div className="space-y-2">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{comment.author}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {comment.timestamp.toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => onDeleteComment(blockId, comment.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                            title="Delete comment"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Add Comment Input */}
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a comment..."
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                rows={2}
              />
              <div className="flex justify-end mt-1">
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default BlockHoverMenu; 