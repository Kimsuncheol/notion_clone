'use client';
import React, { useState, KeyboardEvent, useEffect } from 'react';

interface Props { 
  onSave: (title: string) => void; 
  initialValue?: string;
}

const TitleInput: React.FC<Props> = ({ onSave, initialValue = '' }) => {
  const [value, setValue] = useState(initialValue);

  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSave(value.trim() || 'Untitled');
      // optionally blur
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <input
      type="text"
      placeholder="Untitled"
      className="w-full bg-transparent text-5xl sm:text-6xl font-bold focus:outline-none placeholder:text-gray-400 mb-12"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
};

export default TitleInput; 