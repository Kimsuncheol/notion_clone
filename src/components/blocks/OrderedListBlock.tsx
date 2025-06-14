import React, { useState, KeyboardEvent, useRef, useEffect, useCallback } from 'react';
import type { OrderedListItem } from '@/types/blocks';
import { useEditMode } from '@/contexts/EditModeContext';

interface Props {
  initialItems?: OrderedListItem[];
  onContentChange?: (content: OrderedListItem[]) => void;
  onArrowPrevBlock?: (itemIndex: number) => void;
  onArrowNextBlock?: (itemIndex: number) => void;
  toTextBlock?: () => void;
}

const OrderedListBlock: React.FC<Props> = ({ 
  initialItems = [{ text: '', level: 0, numberType: '1' }], 
  onContentChange,
  onArrowPrevBlock, 
  onArrowNextBlock, 
  toTextBlock 
}) => {
  const [items, setItems] = useState<OrderedListItem[]>(initialItems);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const { isEditMode } = useEditMode();

  useEffect(() => {
    // ensure refs array length matches items
    inputsRef.current = inputsRef.current.slice(0, items.length);
  }, [items.length]);

  // Update parent when items change - but only if content actually changed
  const memoizedOnContentChange = useCallback((newItems: OrderedListItem[]) => {
    onContentChange?.(newItems);
  }, [onContentChange]);

  useEffect(() => {
    // Only call if items are different from initialItems to avoid infinite loops
    const itemsChanged = JSON.stringify(items) !== JSON.stringify(initialItems);
    if (itemsChanged) {
      memoizedOnContentChange(items);
    }
  }, [items, memoizedOnContentChange, initialItems]);

  // Helper function to get default numbering type for a given level
  const getDefaultNumberTypeForLevel = (level: number): '1' | 'A' | 'a' | 'I' | 'i' => {
    const levelTypes: ('1' | 'A' | 'a' | 'I' | 'i')[] = ['1', 'a', 'i', 'A'];
    return levelTypes[level % levelTypes.length];
  };

  // Helper function to generate number/letter based on type, index, and level context
  const getNumbering = (index: number, item: OrderedListItem, allItems: OrderedListItem[]): string => {
    // Find the actual index within the same level and same parent context
    let levelIndex = 1;
    const parentLevel = item.level - 1;
    let lastParentIndex = -1;
    
    // Find the last item of the parent level before current index
    for (let i = index - 1; i >= 0; i--) {
      if (allItems[i].level === parentLevel) {
        lastParentIndex = i;
        break;
      }
    }
    
    // Count items at the same level since the last parent (or from beginning)
    for (let i = Math.max(0, lastParentIndex + 1); i <= index; i++) {
      if (allItems[i].level === item.level) {
        if (i === index) break;
        levelIndex++;
      }
    }
    
    const type = item.numberType || getDefaultNumberTypeForLevel(item.level);
    
    switch (type) {
      case '1':
        return `${levelIndex}.`;
      case 'A':
        return levelIndex <= 26 ? `${String.fromCharCode(64 + levelIndex)}.` : `${levelIndex}.`;
      case 'a':
        return levelIndex <= 26 ? `${String.fromCharCode(96 + levelIndex)}.` : `${levelIndex}.`;
      case 'I':
        return `${toRoman(levelIndex)}.`;
      case 'i':
        return `${toRoman(levelIndex).toLowerCase()}.`;
      default:
        return `${levelIndex}.`;
    }
  };

  // Helper function to convert number to Roman numerals
  const toRoman = (num: number): string => {
    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    let result = '';
    
    for (let i = 0; i < values.length; i++) {
      while (num >= values[i]) {
        result += symbols[i];
        num -= values[i];
      }
    }
    
    return result;
  };

  // Helper function to cycle through number types
  const cycleNumberType = (currentType: '1' | 'A' | 'a' | 'I' | 'i' = '1'): '1' | 'A' | 'a' | 'I' | 'i' => {
    const types: ('1' | 'A' | 'a' | 'I' | 'i')[] = ['1', 'A', 'a', 'I', 'i'];
    const currentIndex = types.indexOf(currentType);
    return types[(currentIndex + 1) % types.length];
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (!isEditMode) return;
    
    if (e.key === 'Enter') {
      e.preventDefault();
      setItems((prev) => {
        const next = [...prev];
        const currentLevel = prev[idx].level;
        next.splice(idx + 1, 0, { 
          text: '', 
          level: currentLevel,
          numberType: prev[idx].numberType || getDefaultNumberTypeForLevel(currentLevel)
        });
        return next;
      });
      // focus new line after DOM update
      setTimeout(() => inputsRef.current[idx + 1]?.focus(), 0);
    } else if (e.key === 'Backspace' && items[idx].text === '') {
      if (items.length === 1) {
        e.preventDefault();
        // convert whole list to text block
        toTextBlock?.();
        return;
      }
      e.preventDefault();
      setItems((prev) => {
        const next = [...prev];
        next.splice(idx, 1);
        return next;
      });
      setTimeout(() => {
        const target = inputsRef.current[Math.max(0, idx - 1)];
        target?.focus();
      }, 0);
    } else if (e.key === 'ArrowUp' && idx === 0) {
      e.preventDefault();
      onArrowPrevBlock?.(idx);
    } else if (e.key === 'ArrowDown' && idx === items.length - 1) {
      e.preventDefault();
      onArrowNextBlock?.(idx);
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Tab indentation rules
      if (items.length === 1 && idx === 0) {
        // behave like ArrowDown when single item list
        e.preventDefault();
        onArrowNextBlock?.(idx);
        return;
      }
      if (idx > 0) {
        e.preventDefault();
        setItems((prev) => {
          const next = [...prev];
          const newLevel = Math.min(next[idx].level + 1, 3);
          next[idx] = { 
            ...next[idx], 
            level: newLevel,
            // Auto-set numbering type based on new level
            numberType: getDefaultNumberTypeForLevel(newLevel)
          };
          return next;
        });
        setTimeout(() => inputsRef.current[idx]?.focus(), 0);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      // Shift+Tab to decrease indent
      e.preventDefault();
      setItems((prev) => {
        const next = [...prev];
        const newLevel = Math.max(next[idx].level - 1, 0);
        next[idx] = { 
          ...next[idx], 
          level: newLevel,
          // Auto-set numbering type based on new level
          numberType: getDefaultNumberTypeForLevel(newLevel)
        };
        return next;
      });
      setTimeout(() => inputsRef.current[idx]?.focus(), 0);
    } else if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault();
      setTimeout(() => inputsRef.current[idx - 1]?.focus(), 0);
    } else if (e.key === 'ArrowDown' && idx < items.length - 1) {
      e.preventDefault();
      setTimeout(() => inputsRef.current[idx + 1]?.focus(), 0);
    }
  };

  const handleNumberClick = (idx: number) => {
    if (!isEditMode) return;
    
    setItems((prev) => {
      const next = [...prev];
      next[idx] = { 
        ...next[idx], 
        numberType: cycleNumberType(next[idx].numberType)
      };
      return next;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    if (isEditMode) {
      const val = e.target.value;
      setItems((prev) => prev.map((v, i) => (i === idx ? { ...v, text: val } : v)));
    }
  };

  return (
    <ol className="pl-5 space-y-1">
      {items.map((item, idx) => {
        const numbering = getNumbering(idx, item, items);
        return (
          <li key={idx} className="flex items-start" style={{ paddingLeft: item.level * 16 }}>
            <button
              onClick={() => handleNumberClick(idx)}
              className={`select-none mr-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium min-w-[24px] text-left ${
                isEditMode ? 'cursor-pointer' : 'cursor-default'
              }`}
              title={isEditMode ? `Level ${item.level}: ${item.numberType || getDefaultNumberTypeForLevel(item.level)} - Click to cycle types` : ''}
              tabIndex={isEditMode ? -1 : undefined}
              disabled={!isEditMode}
            >
              {numbering}
            </button>
            <input
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              aria-label={`Ordered list item ${idx}`}
              className={`w-full bg-transparent focus:outline-none ${
                !isEditMode ? 'cursor-default' : ''
              }`}
              value={item.text}
              placeholder="List item"
              onChange={(e) => handleChange(e, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              disabled={!isEditMode}
              readOnly={!isEditMode}
            />
          </li>
        );
      })}
    </ol>
  );
};

export default OrderedListBlock; 