import React from 'react';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import SplitscreenIcon from '@mui/icons-material/Splitscreen';

export type ViewMode = 'edit' | 'preview' | 'split';

interface ViewModeControlsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewModeControls: React.FC<ViewModeControlsProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onViewModeChange('edit')}
        className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${viewMode === 'edit'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
      >
        <EditIcon fontSize="small" />
        Edit
      </button>

      <button
        onClick={() => onViewModeChange('preview')}
        className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${viewMode === 'preview'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
      >
        <VisibilityIcon fontSize="small" />
        Preview
      </button>

      <button
        onClick={() => onViewModeChange('split')}
        className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${viewMode === 'split'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
          }`}
      >
        <SplitscreenIcon fontSize="small" />
        Split
      </button>
    </div>
  );
};

export default ViewModeControls; 