import React from 'react';

interface SaveStatusProps {
  isSaving: boolean;
}

const SaveStatus: React.FC<SaveStatusProps> = ({ isSaving }) => {
  if (isSaving) {
    return (
      <div className="ml-auto text-sm text-gray-500 flex items-center gap-2">
        <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-500 border-t-transparent"></div>
        Saving...
      </div>
    );
  }

  return (
    <div className="ml-auto text-xs text-gray-400 flex items-center gap-2">
      <span>Press</span>
      <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
        {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + S
      </kbd>
      <span>to save manually</span>
    </div>
  );
};

export default SaveStatus; 