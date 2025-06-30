'use client';
import React, { useState, useCallback } from 'react';
import { EmojiBlock as EmojiBlockType } from '@/types/blocks';
import EmojiPicker from 'emoji-picker-react';
import { useEditMode } from '@/contexts/EditModeContext';

interface Props {
  block: EmojiBlockType;
  onUpdate: (blockId: string, content: EmojiBlockType['content']) => void;
}

const EmojiBlock: React.FC<Props> = ({ 
  block,
  onUpdate
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const { isEditMode } = useEditMode();

  const handleEmojiSelect = useCallback((emojiData: { emoji: string }) => {
    onUpdate(block.id, {
      emoji: emojiData.emoji,
      size: block.content.size || 'medium',
    });
    setShowPicker(false);
  }, [block.id, block.content.size, onUpdate]);

  const handleSizeChange = useCallback((size: 'small' | 'medium' | 'large') => {
    onUpdate(block.id, {
      emoji: block.content.emoji,
      size,
    });
  }, [block.id, block.content.emoji, onUpdate]);

  const handleRemoveEmoji = useCallback(() => {
    onUpdate(block.id, {
      emoji: '',
      size: 'medium',
    });
  }, [block.id, onUpdate]);

  const getSizeClass = (size?: string): string => {
    switch (size) {
      case 'small': return 'text-2xl';
      case 'large': return 'text-8xl';
      default: return 'text-5xl'; // medium
    }
  };

  return (
    <div className="w-full relative">
      {block.content.emoji ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className={`${getSizeClass(block.content.size)} select-none`}>
            {block.content.emoji}
          </div>
          
          {isEditMode && (
            <div className="flex flex-col items-center gap-2">
              {/* Size Controls */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Size:</span>
                <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeChange(size)}
                      className={`px-3 py-1 text-xs rounded transition-colors ${
                        block.content.size === size || (!block.content.size && size === 'medium')
                          ? 'bg-blue-500 text-white'
                          : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPicker(true)}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-600 dark:text-blue-400 rounded text-sm font-medium transition-colors"
                >
                  Change Emoji
                </button>
                <button
                  onClick={handleRemoveEmoji}
                  className="px-3 py-1 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 rounded text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8">
          <div className="text-4xl">😀</div>
          <div className="text-gray-700 dark:text-gray-300 font-medium">
            {isEditMode ? 'Click to add an emoji' : 'No emoji selected'}
          </div>
          {isEditMode && (
            <button
              onClick={() => setShowPicker(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium transition-colors"
            >
              Choose Emoji
            </button>
          )}
        </div>
      )}

      {/* Emoji Picker */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowPicker(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Choose an Emoji</h3>
              <button
                onClick={() => setShowPicker(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-2">
              <EmojiPicker
                onEmojiClick={handleEmojiSelect}
                width={350}
                height={400}
                searchDisabled={false}
                skinTonesDisabled={false}
                previewConfig={{
                  showPreview: true,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmojiBlock; 