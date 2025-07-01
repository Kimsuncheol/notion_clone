import React from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';

interface NoteModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'general' | 'markdown') => void;
}

const NoteModeSelector: React.FC<NoteModeSelectorProps> = ({
  isOpen,
  onClose,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-60 top-0 w-80 bg-white dark:bg-[#262626] shadow-lg z-50 border-r border-b border-gray-200 dark:border-gray-700">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Select note mode
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Mode Options */}
          <div className="space-y-4">
            {/* General Mode */}
            <button
              onClick={() => onSelectMode('general')}
              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <DescriptionIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    General
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Rich text editor with blocks, images, tables, and more formatting options
                  </p>
                </div>
              </div>
            </button>

            {/* Markdown Mode */}
            <button
              onClick={() => onSelectMode('markdown')}
              className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CodeIcon className="w-6 h-6 text-green-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Markdown
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Plain text editor with markdown syntax support and live preview
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can always change the note mode later in the note settings.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NoteModeSelector; 