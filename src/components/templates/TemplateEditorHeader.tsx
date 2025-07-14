"use client";

import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Template } from '@/types/templates';

interface TemplateEditorHeaderProps {
  selectedTemplate: Template;
  tempTitle: string;
  isCreating: boolean;
  onBack: () => void;
  onTitleChange: (title: string) => void;
  onCreateNote: () => void;
}

const TemplateEditorHeader: React.FC<TemplateEditorHeaderProps> = ({
  selectedTemplate,
  tempTitle,
  isCreating,
  onBack,
  onTitleChange,
  onCreateNote,
}) => {
  return (
    <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowBackIcon fontSize="small" />
            Back to Templates
          </button>
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
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          />
          <button
            onClick={onCreateNote}
            disabled={isCreating || !tempTitle.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isCreating ? 'Creating...' : 'Create Note'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditorHeader; 