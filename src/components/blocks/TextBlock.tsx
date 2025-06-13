'use client';
import React, { KeyboardEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { TextBlock as TextBlockType, BlockType } from '@/types/blocks';

export interface TextBlockHandle {
  focus: () => void;
}

interface Props {
  block: TextBlockType;
  onUpdate: (id: string, content: string) => void;
  onConvert: (id: string, component: BlockType) => void;
  onAddBelow: (id: string) => void;
  onArrowPrev: (id: string) => void;
  onArrowNext: (id: string) => void;
  onRemove: (id: string) => void;
}

const commandRegex = /^\/(list|table|chart|image|pdf)$/i;

const TextBlock = forwardRef<TextBlockHandle, Props>(({ block, onUpdate, onConvert, onAddBelow, onArrowPrev, onArrowNext, onRemove }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus();
    },
  }));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const value = e.currentTarget.value.trim();
    const match = value.match(commandRegex);
    if (match) {
      e.preventDefault();
      const componentName = match[1].toLowerCase() as BlockType;
      onConvert(block.id, componentName);
      return;
    }
    // plain enter => add new text block below
    e.preventDefault();
    onAddBelow(block.id);
  };

  const handleArrowKeys = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onArrowNext(block.id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onArrowPrev(block.id);
    }
  };

  const handleBackspace = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onRemove(block.id);
    }
  };

  return (
    <input
      type="text"
      aria-label="Text"
      className="w-full bg-transparent text-base focus:outline-none placeholder:text-gray-400"
      placeholder="Start writing..."
      value={block.content}
      onChange={(e) => onUpdate(block.id, e.target.value)}
      onKeyDown={(e)=>{handleBackspace(e); handleArrowKeys(e); handleKeyDown(e);}}
      ref={inputRef}
    />
  );
});

TextBlock.displayName = 'TextBlock';

export default TextBlock; 