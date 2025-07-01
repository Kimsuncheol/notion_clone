import React, { useState } from 'react';
import Profile from '../Profile';
import NoteModeSelector from './NoteModeSelector';
import { useAppDispatch } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';

interface WorkspaceHeaderProps {
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  addNewNoteHandler: (mode: 'general' | 'markdown') => void;
  isLoading: boolean;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  showProfile,
  setShowProfile,
  addNewNoteHandler,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const [showNoteModeSelector, setShowNoteModeSelector] = useState(false);

  const handleNewButtonClick = () => {
    setShowNoteModeSelector(true);
  };

  const handleModeSelect = (mode: 'general' | 'markdown') => {
    setShowNoteModeSelector(false);
    addNewNoteHandler(mode);
  };

  return (
    <>
      <div className="relative">
        <div className="flex items-center justify-between mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <div className="flex items-center gap-1 cursor-pointer workspace-toggle" onClick={() => setShowProfile(!showProfile)}>
            <span>Workspace</span>
            <span className={`text-xs transition-transform ${showProfile ? 'rotate-180' : ''}`}>▼</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="New note"
              onClick={handleNewButtonClick}
              className="text-sm px-2 py-1 font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              disabled={isLoading}
            >
              📝 New
            </button>
          </div>
        </div>

        {/* Profile Dropdown */}
        {showProfile && (
          <div className="absolute top-8 left-2 z-10 mb-4 profile-dropdown">
            <Profile
              onClose={() => setShowProfile(false)}
              onWorkspaceChange={() => dispatch(loadSidebarData())}
            />
          </div>
        )}
      </div>

      {/* Note Mode Selector */}
      <NoteModeSelector
        isOpen={showNoteModeSelector}
        onClose={() => setShowNoteModeSelector(false)}
        onSelectMode={handleModeSelect}
      />
    </>
  );
};

export default WorkspaceHeader; 