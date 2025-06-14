'use client';
import React, { KeyboardEvent, forwardRef, useImperativeHandle, useRef } from 'react';
import { StyledTextBlock as StyledTextBlockType } from '@/types/blocks';
import { useEditMode } from '@/contexts/EditModeContext';

interface Props {
  block: StyledTextBlockType;
  onUpdate: (id: string, content: string) => void;
  onArrowPrev: (id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => void;
  onArrowNext: (id: string, fromCoordinate?: { row?: number; col?: number; itemIndex?: number }) => void;
  onConvertToText: (id: string) => void;
}

export interface StyledHandle { focus: () => void; }

const StyledTextBlock = forwardRef<StyledHandle, Props>(({ block, onUpdate, onArrowPrev, onArrowNext, onConvertToText }, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isEditMode } = useEditMode();
  
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isEditMode) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      onArrowNext(block.id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onArrowPrev(block.id);
    } else if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      onConvertToText(block.id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) {
      onUpdate(block.id, e.target.value);
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      aria-label="Styled text"
      className={`w-full bg-transparent focus:outline-none ${block.className} ${
        !isEditMode ? 'cursor-default' : ''
      }`}
      placeholder="Write..."
      value={block.content}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={!isEditMode}
      readOnly={!isEditMode}
    />
  );
});

StyledTextBlock.displayName = 'StyledTextBlock';

export default StyledTextBlock; 