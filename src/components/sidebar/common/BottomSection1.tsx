import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import { getFolderByType } from '@/store/slices/sidebarSlice';
import type { FolderNode } from '@/store/slices/sidebarSlice';

interface BottomSection1Props {
  folders: FolderNode[];
  setShowTrashSidebar: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  onHeightChange: (height: number) => void;
}

const BottomSection1: React.FC<BottomSection1Props> = ({
  folders,
  setShowTrashSidebar,
  setShowSettings,
  onHeightChange,
}) => {
  const router = useRouter();
  const trashFolder = getFolderByType(folders, 'trash');
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (sectionRef.current) {
      const height = sectionRef.current.offsetHeight;
      console.log(`BottomSection1 height: ${height}px`);
      onHeightChange(height);
    }
  }, [folders.length, trashFolder?.notes.length, onHeightChange]);

  return (
    <div className='flex flex-col p-2 w-full' ref={sectionRef}>
      {/* Templates Section */}
      <div className="">
        <button
          onClick={() => router.push('/templates')}
          className="w-full flex items-center justify-between px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <DescriptionIcon className="text-purple-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Templates
          </span>
        </button>
      </div>

      {/* Trash Section */}
      <div className="">
        <button
          onClick={() => setShowTrashSidebar(true)}
          className="w-full flex items-center justify-between px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <DeleteOutlineIcon className="text-red-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Trash
            {trashFolder && trashFolder.notes.length > 0 ? (
                <span className="ml-1 text-xs text-gray-400">({trashFolder.notes.length})</span>
              ) : null}
          </span>
        </button>
      </div>

      {/* Settings Section */}
      <div className="">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center justify-between px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <SettingsIcon className="text-gray-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Settings
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomSection1; 