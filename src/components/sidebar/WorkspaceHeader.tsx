import React, { useRef, useEffect } from 'react';
import Profile from '../Profile';
import { useAppDispatch } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';
import NoteAddIcon from '@mui/icons-material/NoteAdd';

interface WorkspaceHeaderProps {
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  addNewNoteHandler: (mode: 'markdown') => void;
  isLoading: boolean;
}

const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  showProfile,
  setShowProfile,
  addNewNoteHandler,
  isLoading,
}) => {
  const dispatch = useAppDispatch();
  const headerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (headerRef.current) {
      const height = headerRef.current.offsetHeight;
      console.log(`WorkspaceHeader height: ${height}px`);
    }
  }, [showProfile]);

  const handleNewButtonClick = () => {
    addNewNoteHandler('markdown');
  };

  return (
    <>
      <div className="relative z-[1000]" ref={headerRef}>
        <div className="flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
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
              <NoteAddIcon style={{ fontSize: '16px' }} /> New
            </button>
          </div>
        </div>

        {/* Profile Dropdown */}
        {showProfile && (
          <div className="absolute top-[38px] left-2 mb-4 profile-dropdown">
            <Profile
              onClose={() => setShowProfile(false)}
              onWorkspaceChange={() => dispatch(loadSidebarData())}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default WorkspaceHeader; 