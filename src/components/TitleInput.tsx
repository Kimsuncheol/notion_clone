'use client';
import React, { useState, KeyboardEvent } from 'react';

interface Props { onSave: (title: string) => void; }

const TitleInput: React.FC<Props> = ({ onSave }) => {
  const [value, setValue] = useState('');

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