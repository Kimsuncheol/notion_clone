import React from 'react';

const NoteContent: React.FC = () => (
  <input
    type="text"
    placeholder="Start writing..."
    className="w-full bg-transparent text-base focus:outline-none placeholder:text-gray-400"
  />
);

export default NoteContent; 