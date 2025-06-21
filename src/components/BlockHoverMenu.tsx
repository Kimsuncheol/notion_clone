'use client';
import React, { useState, useRef, useEffect } from 'react';
import { BlockType } from '@/types/blocks';
import { Comment } from '@/types/comments';
import AddIcon from '@mui/icons-material/Add';
import AddCommentIcon from '@mui/icons-material/AddComment';

interface BlockHoverMenuProps {
  blockId: string;
  blockType: BlockType;
  isVisible: boolean;
  position: { x: number; y: number };
  onConvertBlock: (blockId: string, newType: BlockType) => void;
  onConvertStyled: (blockId: string, className: string) => void;
  onRemoveBlock: (blockId: string) => void;
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
  onRemoveBlock,
  comments,
  onAddComment,
  onDeleteComment,
}) => {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const [showTextSubmenu, setShowTextSubmenu] = useState(false);
  const [showListSubmenu, setShowListSubmenu] = useState(false);
  const [showUnorderedListSubmenu, setShowUnorderedListSubmenu] = useState(false);
  const [showOrderedListSubmenu, setShowOrderedListSubmenu] = useState(false);
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
        setShowListSubmenu(false);
        setShowUnorderedListSubmenu(false);
        setShowOrderedListSubmenu(false);
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
      setShowListSubmenu(false);
      setShowUnorderedListSubmenu(false);
      setShowOrderedListSubmenu(false);
      setShowCommentWidget(false);
    }
  }, [isVisible]);

  const handleBlockConvert = (newType: BlockType) => {
    onConvertBlock(blockId, newType);
    setShowBlockMenu(false);
    setShowTextSubmenu(false);
    setShowListSubmenu(false);
    setShowUnorderedListSubmenu(false);
    setShowOrderedListSubmenu(false);
  };

  const handleStyledConvert = (className: string) => {
    onConvertStyled(blockId, className);
    setShowBlockMenu(false);
    setShowTextSubmenu(false);
    setShowListSubmenu(false);
    setShowUnorderedListSubmenu(false);
    setShowOrderedListSubmenu(false);
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
    { type: 'list' as BlockType, icon: '📋', label: 'List', hasSubmenu: true },
    { type: 'table' as BlockType, icon: '⊞', label: 'Table' },
    { type: 'image' as BlockType, icon: '🖼️', label: 'Image' },
    { type: 'chart' as BlockType, icon: '📊', label: 'Chart' },
    { type: 'pdf' as BlockType, icon: '📄', label: 'PDF' },
  ];

  const listSubmenuItems = [
    { type: 'list' as BlockType, icon: '•', label: 'Unordered List', hasSubmenu: true },
    { type: 'orderedlist' as BlockType, icon: '1.', label: 'Ordered List', hasSubmenu: true },
  ];

  const unorderedListSubmenuItems = [
    { type: 'list', icon: '•', label: 'Bullet (•)', style: 'bullet' },
    { type: 'list', icon: '◦', label: 'Circle (◦)', style: 'circle' },
    { type: 'list', icon: '▪', label: 'Square (▪)', style: 'square' },
    { type: 'list', icon: '▫', label: 'White Square (▫)', style: 'white-square' },
  ];

  const orderedListSubmenuItems = [
    { type: 'orderedlist', icon: '1.', label: 'Numbers (1, 2, 3)', style: '1' },
    { type: 'orderedlist', icon: 'A.', label: 'Capital Letters (A, B, C)', style: 'A' },
    { type: 'orderedlist', icon: 'a.', label: 'Lowercase Letters (a, b, c)', style: 'a' },
    { type: 'orderedlist', icon: 'I.', label: 'Roman Numerals (I, II, III)', style: 'I' },
    { type: 'orderedlist', icon: 'i.', label: 'Lowercase Roman (i, ii, iii)', style: 'i' },
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
          left: position.x - 120,   // 120 is the width of the block menu, don't change this
          top: position.y,
        }}
      >
      {/* Remove Block Icon */}
      <button
        onClick={() => onRemoveBlock(blockId)}
        className="px-2 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded border border-red-300 dark:border-red-600 transition-colors"
        title="Remove block"
      >
        🗑️
      </button>

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
          <AddIcon />
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
                    } else if (item.hasSubmenu && item.type === 'list') {
                      setShowListSubmenu(!showListSubmenu);
                    } else {
                      handleBlockConvert(item.type);
                    }
                  }}
                  onMouseEnter={() => {
                    if (item.hasSubmenu && item.type === 'text') {
                      setShowTextSubmenu(true);
                      setShowListSubmenu(false);
                    } else if (item.hasSubmenu && item.type === 'list') {
                      setShowListSubmenu(true);
                      setShowTextSubmenu(false);
                    } else {
                      setShowTextSubmenu(false);
                      setShowListSubmenu(false);
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

                {/* List Submenu */}
                {item.type === 'list' && showListSubmenu && (
                  <div className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg py-1 min-w-48 z-70">
                    {listSubmenuItems.map((subItem, index) => (
                      <div key={index} className="relative">
                        <button
                          onClick={() => {
                            if (subItem.hasSubmenu && subItem.type === 'list') {
                              setShowUnorderedListSubmenu(!showUnorderedListSubmenu);
                            } else if (subItem.hasSubmenu && subItem.type === 'orderedlist') {
                              setShowOrderedListSubmenu(!showOrderedListSubmenu);
                            } else {
                              handleBlockConvert(subItem.type);
                            }
                          }}
                          onMouseEnter={() => {
                            if (subItem.hasSubmenu && subItem.type === 'list') {
                              setShowUnorderedListSubmenu(true);
                              setShowOrderedListSubmenu(false);
                            } else if (subItem.hasSubmenu && subItem.type === 'orderedlist') {
                              setShowOrderedListSubmenu(true);
                              setShowUnorderedListSubmenu(false);
                            } else {
                              setShowUnorderedListSubmenu(false);
                              setShowOrderedListSubmenu(false);
                            }
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                        >
                          <span className="text-sm">{subItem.icon}</span>
                          <span className="text-sm">{subItem.label}</span>
                          {subItem.hasSubmenu && <span className="ml-auto text-xs">▶</span>}
                        </button>

                        {/* Unordered List Sub-submenu */}
                        {subItem.type === 'list' && showUnorderedListSubmenu && (
                          <div className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg py-1 min-w-56 z-80">
                            {unorderedListSubmenuItems.map((subSubItem, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => handleBlockConvert(subSubItem.type as BlockType)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                              >
                                <span className="text-sm">{subSubItem.icon}</span>
                                <span className="text-sm">{subSubItem.label}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Ordered List Sub-submenu */}
                        {subItem.type === 'orderedlist' && showOrderedListSubmenu && (
                          <div className="absolute left-full top-0 ml-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg py-1 min-w-64 z-80">
                            {orderedListSubmenuItems.map((subSubItem, subIndex) => (
                              <button
                                key={subIndex}
                                onClick={() => handleBlockConvert(subSubItem.type as BlockType)}
                                className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                              >
                                <span className="text-sm">{subSubItem.icon}</span>
                                <span className="text-sm">{subSubItem.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
          className={`p-2 text-sm bg-gradient-to-r ${
            comments.length > 0 
              ? 'from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 border-blue-300 dark:border-blue-600' 
              : 'from-gray-100 to-gray-100 dark:from-gray-800 dark:to-gray-800 border-gray-300 dark:border-gray-600'
          } hover:from-blue-200 hover:to-indigo-200 dark:hover:from-blue-800/50 dark:hover:to-indigo-800/50 rounded border transition-all duration-200 relative shadow-sm`}
          title={`Comments ${comments.length > 0 ? `(${comments.length})` : ''}`}
        >
          💬
          {comments.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm animate-pulse">
              {comments.length > 99 ? '99+' : comments.length}
            </span>
          )}
        </button>

        {/* Comment Widget */}
        {showCommentWidget && (
          <div
            ref={commentWidgetRef}
            className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-0 w-96 z-60 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  💬 Comments
                  {comments.length > 0 && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full">
                      {comments.length}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowCommentWidget(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg"
                  title="Close comments"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Comments List */}
            <div className="max-h-64 overflow-y-auto p-3">
              {comments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💭</div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Be the first to add a comment!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="group relative">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-600/50 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {comment.author.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{comment.author}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.timestamp.toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <button
                              onClick={() => onDeleteComment(blockId, comment.id)}
                              className="text-red-400 hover:text-red-600 dark:hover:text-red-400 text-sm w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Delete comment"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Add Comment Input */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-600">
              <div className="relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a comment..."
                  className="w-full p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={3}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Press Enter to submit, Shift+Enter for new line
                  </span>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-500 disabled:hover:to-indigo-600 transition-all duration-200 font-medium shadow-sm"
                  >
                    💬 Comment
                  </button>
                </div>
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