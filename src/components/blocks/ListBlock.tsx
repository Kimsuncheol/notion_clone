import React, { useState, KeyboardEvent, useRef, useEffect, useCallback } from 'react';
import type { ListItem } from '@/types/blocks';

interface Props {
  initialItems?: ListItem[];
  onContentChange?: (content: ListItem[]) => void;
  onArrowPrevBlock?: () => void;
  onArrowNextBlock?: () => void;
  toTextBlock?: () => void;
}

const ListBlock: React.FC<Props> = ({ 
  initialItems = [{ text: '', level: 0 }], 
  onContentChange,
  onArrowPrevBlock, 
  onArrowNextBlock, 
  toTextBlock 
}) => {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    // ensure refs array length matches items
    inputsRef.current = inputsRef.current.slice(0, items.length);
  }, [items.length]);

  // Update parent when items change - but only if content actually changed
  const memoizedOnContentChange = useCallback((newItems: ListItem[]) => {
    onContentChange?.(newItems);
  }, [onContentChange]);

  useEffect(() => {
    // Only call if items are different from initialItems to avoid infinite loops
    const itemsChanged = JSON.stringify(items) !== JSON.stringify(initialItems);
    if (itemsChanged) {
      memoizedOnContentChange(items);
    }
  }, [items, memoizedOnContentChange, initialItems]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setItems((prev) => {
        const next = [...prev];
        next.splice(idx + 1, 0, { text: '', level: prev[idx].level });
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
      onArrowPrevBlock?.();
    } else if (e.key === 'ArrowDown' && idx === items.length - 1) {
      e.preventDefault();
      onArrowNextBlock?.();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      // Tab indentation rules
      if (items.length === 1 && idx === 0) {
        // behave like ArrowDown when single item list
        e.preventDefault();
        onArrowNextBlock?.();
        return;
      }
      if (idx > 0) {
        e.preventDefault();
        setItems((prev) => {
          const next = [...prev];
          next[idx] = { ...next[idx], level: Math.min(next[idx].level + 1, 5) };
          return next;
        });
        setTimeout(() => inputsRef.current[idx]?.focus(), 0);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      // Shift+Tab to decrease indent
      e.preventDefault();
      setItems((prev) => {
        const next = [...prev];
        next[idx] = { ...next[idx], level: Math.max(next[idx].level - 1, 0) };
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

  return (
    <ul className="pl-5 space-y-1">
      {items.map((item, idx) => {
        const bulletChars = ['\u2022', '\u25E6', '\u25AA', '\u25AB', '\u25CF'];
        const bullet = bulletChars[item.level % bulletChars.length];
        return (
          <li key={idx} className="flex items-start" style={{ paddingLeft: item.level * 16 }}>
            <span className="select-none mr-2" aria-hidden>
              {bullet}
            </span>
            <input
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              aria-label={`List item ${idx}`}
              className="w-full bg-transparent focus:outline-none"
              value={item.text}
              placeholder="List item"
              onChange={(e) => {
                const val = e.target.value;
                setItems((prev) => prev.map((v, i) => (i === idx ? { ...v, text: val } : v)));
              }}
              onKeyDown={(e) => handleKeyDown(e, idx)}
            />
          </li>
        );
      })}
    </ul>
  );
};

export default ListBlock; 