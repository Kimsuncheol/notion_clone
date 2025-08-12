import React from 'react';

interface HoveringPreviewForSubNoteListProps {
  title: string;
  content: string;
  handleOpen: (subNoteId: string) => void;
  subNoteId: string;
}

const clamp = (text: string, max: number) => {
  if (!text) return '';
  return text.length > max ? text.slice(0, max) + '…' : text;
};

export default function HoveringPreviewForSubNoteList({ title, content, handleOpen, subNoteId }: HoveringPreviewForSubNoteListProps) {
  return (
    <div className="ml-2 w-40 p-3 rounded-md shadow-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      handleOpen(subNoteId);
    }}>
      <div className="text-sm font-semibold mb-1 truncate" title={title}>{clamp(title, 50)}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
        {clamp(content.replace(/\s+/g, ' ').trim(), 50)}
      </div>
    </div>
  );
}


