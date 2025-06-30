'use client';
import React, { KeyboardEvent, forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { TextBlock as TextBlockType, BlockType } from '@/types/blocks';
import { useEditMode } from '@/contexts/EditModeContext';
import ChartKeywordMenu from '../ChartKeywordMenu';
import EmojiPicker from 'emoji-picker-react';

export interface TextBlockHandle {
  focus: () => void;
}

interface Props {
  block: TextBlockType;
  onUpdate: (id: string, content: string) => void;
  onConvert: (id: string, component: BlockType, options?: { chartType?: string }) => void;
  onAddBelow: (id: string) => void;
  onArrowPrev: (id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => void;
  onArrowNext: (id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => void;
  onRemove: (id: string) => void;
  onConvertStyled: (id: string, className: string) => void;
}

const commandRegex = /^\/(list|orderedlist|ol|table|chart|image|code|latex)$/i;

// Chart keyword tokens
const chartTokens = [
  { tokens: ['/ba', '/bar'], type: 'bar', label: 'Bar Chart' },
  { tokens: ['/li', '/lin', '/line'], type: 'line', label: 'Line Chart' },
  { tokens: ['/pi', '/pie'], type: 'pie', label: 'Pie Chart' },
  { tokens: ['/sc', '/scatter'], type: 'scatter', label: 'Scatter Plot' },
  { tokens: ['/ga', '/gauge'], type: 'gauge', label: 'Gauge Chart' }
];

function mapSlashToClass(cmd: string): string | null {
  // headings
  const headingMatch = cmd.match(/^h([1-5])$/);
  if (headingMatch) {
    const n = Number(headingMatch[1]);
    const sizeMap = ['text-4xl','text-3xl','text-2xl','text-xl','text-lg'];
    return sizeMap[n-1];
  }

  if (cmd === 'b') {
    return 'font-bold';
  }

  // Patterns with b/i prefixes + heading e.g., bh2, ih3, bih4, ibh5
  const complexMatch = cmd.match(/^(b?i?)(h([1-5]))$/);
  if (complexMatch) {
    const n = Number(complexMatch[3]);
    const sizeMap = ['text-4xl','text-3xl','text-2xl','text-xl','text-lg'];
    const sizeClass = sizeMap[n-1];
    const prefix = complexMatch[1];
    const bold = prefix.includes('b') ? ' font-bold' : '';
    const italic = prefix.includes('i') ? ' italic' : '';
    return `${sizeClass}${bold}${italic}`.trim();
  }

  // standalone italics or bold-italic could be added similarly
  return null;
}

const TextBlock = forwardRef<TextBlockHandle, Props>(({ block, onUpdate, onConvert, onAddBelow, onArrowPrev, onArrowNext, onRemove, onConvertStyled }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isEditMode } = useEditMode();
  const [showChartMenu, setShowChartMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [filterToken, setFilterToken] = useState<string>('');

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isEditMode) return;
    
    if (e.key !== 'Enter') return;
    const value = e.currentTarget.value.trim();
    const match = value.match(commandRegex);
    if (match) {
      e.preventDefault();
      let componentName = match[1].toLowerCase();
      // Handle alias for ordered list
      if (componentName === 'ol') {
        componentName = 'orderedlist';
      }
      onConvert(block.id, componentName as BlockType);
      return;
    }

    // styled commands
    if (value.startsWith('/')) {
      const cmd = value.slice(1).toLowerCase();
      const className = mapSlashToClass(cmd);
      if (className) {
        e.preventDefault();
        onConvertStyled(block.id, className);
        return;
      }
    }

    // plain enter => add new text block below
    e.preventDefault();
    onAddBelow(block.id);
  };

  const handleArrowKeys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isEditMode) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onArrowNext(block.id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onArrowPrev(block.id);
    }
  };

  const handleBackspace = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isEditMode) return;
    
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onRemove(block.id);
    }
  };

  // Handle chart keyword menu positioning
  const updateMenuPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setMenuPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
    }
  };

  // Detect chart tokens in text
  const detectChartToken = (text: string) => {
    const lowerText = text.toLowerCase().trim();
    // Simplified test - show menu for any text containing "chart"
    if (lowerText.includes('chart')) {
      return 'chart';
    }
    
    // Original chart token detection
    for (const chart of chartTokens) {
      for (const token of chart.tokens) {
        if (lowerText.includes(token)) {
          return token;
        }
      }
    }
    return null;
  };

  // Handle chart selection from menu
  const handleChartSelect = (chartType: string) => {
    // Convert current text block to chart block
    onConvert(block.id, 'chart', { chartType });
    setShowChartMenu(false);
  };

  // Handle emoji selection
  const handleEmojiSelect = (emojiData: { emoji: string }) => {
    if (inputRef.current) {
      const input = inputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = block.content.slice(0, start) + emojiData.emoji + block.content.slice(end);
      onUpdate(block.id, newValue);
      
      // Move cursor after the emoji
      setTimeout(() => {
        const newCursorPos = start + emojiData.emoji.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
        input.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Handle emoji button click
  const handleEmojiButtonClick = () => {
    setShowEmojiPicker(!showEmojiPicker);
    updateMenuPosition();
  };

  // Close menu on outside click
  useEffect(() => {
    if (!showChartMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.chart-keyword-menu')) {
        setShowChartMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showChartMenu]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) {
      const newValue = e.target.value;
      onUpdate(block.id, newValue);
      
      // Check for chart tokens
      const detectedToken = detectChartToken(newValue);
      if (detectedToken) {
        setFilterToken(detectedToken);
        setShowChartMenu(true);
        // Use setTimeout to ensure DOM is updated before positioning
        setTimeout(() => updateMenuPosition(), 0);
      } else {
        setShowChartMenu(false);
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          aria-label="Text"
          className={`flex-1 bg-transparent text-base focus:outline-none placeholder:text-gray-400 ${showChartMenu ? 'border-b-2 border-blue-500' : ''} ${
            !isEditMode ? 'cursor-default' : ''
          }`}
          placeholder="Start writing..."
          value={block.content}
          onChange={handleChange}
          onKeyDown={(e)=>{handleBackspace(e); handleArrowKeys(e); handleKeyDown(e);}}
          ref={inputRef}
          disabled={!isEditMode}
          readOnly={!isEditMode}
        />
        
        {isEditMode && (
          <button
            onClick={handleEmojiButtonClick}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
            title="Add emoji"
            type="button"
          >
            😀
          </button>
        )}
      </div>

      {/* Chart Keyword Menu */}
      {showChartMenu && (
        <div 
          className="fixed z-50 chart-keyword-menu"
          style={{ 
            top: menuPosition.y, 
            left: menuPosition.x 
          }}
        >
          <ChartKeywordMenu
            onSelectChart={handleChartSelect}
            onClose={() => setShowChartMenu(false)}
            filterToken={filterToken}
          />
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowEmojiPicker(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Choose an Emoji</h3>
              <button
                onClick={() => setShowEmojiPicker(false)}
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
});

TextBlock.displayName = 'TextBlock';

export default TextBlock; 