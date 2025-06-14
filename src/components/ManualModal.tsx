'use client';
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ManualModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="bg-[color:var(--background)] text-[color:var(--foreground)] rounded shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-2 right-2 text-lg px-2"
          onClick={onClose}
          aria-label="Close manual"
        >
          ✖
        </button>
        <h2 className="text-xl font-semibold mb-4">Note Manual</h2>
        <p className="mb-2">Use slash commands to insert blocks, e.g. /list, /orderedlist (or /ol), /table, /h1, /b, etc.</p>
        <p className="mb-2">Navigate with Arrow keys, Tab for list indentation, Enter to create new items.</p>
        <p className="mb-2">For ordered lists: Click the number/letter to cycle through numbering types (1, A, a, I, i).</p>
        <p>Drag & drop images into image blocks. Backspace deletes empty blocks.</p>
      </div>
    </div>
  );
};

export default ManualModal; 