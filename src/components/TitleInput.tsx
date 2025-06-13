'use client';
import React from 'react';

const TitleInput: React.FC = () => (
  <input
    type="text"
    placeholder="Untitled"
    className="w-full bg-transparent text-4xl sm:text-5xl font-bold focus:outline-none placeholder:text-gray-400 mb-8"
  />
);

export default TitleInput; 