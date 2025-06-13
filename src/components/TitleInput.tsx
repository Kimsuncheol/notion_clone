'use client';
import React from 'react';

const TitleInput: React.FC = () => (
  <input
    type="text"
    placeholder="Untitled"
    className="w-full bg-transparent text-5xl sm:text-6xl font-bold focus:outline-none placeholder:text-gray-400 mb-12"
  />
);

export default TitleInput; 