'use client';
import React, { useState, KeyboardEvent, useEffect } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';

interface Props { 
  onSave: (title: string) => void; 
  initialValue?: string;
}

const TitleInput: React.FC<Props> = ({ onSave, initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);
  const { isEditMode } = useEditMode();

  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isEditMode) {
      e.preventDefault();
      onSave(value.trim() || 'Untitled');
      // optionally blur
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) {
      setValue(e.target.value);
    }
  };

  return (
    <input
      type="text"
      placeholder="Untitled"
      className={`w-full bg-transparent text-5xl sm:text-6xl font-bold focus:outline-none placeholder:text-gray-400 mb-12 ${
        !isEditMode ? 'cursor-default' : ''
      }`}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      disabled={!isEditMode}
      readOnly={!isEditMode}
    />
  );
};

export default TitleInput; 