"use client";

import React from 'react';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { Template } from '@/types/templates';

interface TemplateEditorHeaderProps {
  selectedTemplate: Template;
  tempTitle: string;
  isCreating: boolean;
  onTitleChange: (title: string) => void;
  onCreateNote: () => void;
}

const TemplateEditorHeader: React.FC<TemplateEditorHeaderProps> = ({
  selectedTemplate,
  tempTitle,
  isCreating,
  onTitleChange,
  onCreateNote,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Template: {selectedTemplate.name}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={tempTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Enter note title..."
            className="px-4 py-[7px] border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] text-sm"
          />
          <button
            onClick={onCreateNote}
            disabled={isCreating || !tempTitle.trim()}
            className="p-2 bg-blue-600 flex items-center justify-center text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={isCreating ? 'Creating...' : 'Create Note'}
          >
            <NoteAddIcon sx={{ fontSize: 20 }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorHeader; 