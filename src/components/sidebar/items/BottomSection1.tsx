import React, { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PeopleIcon from '@mui/icons-material/People';
import { getFolderByType } from '@/store/slices/sidebarSlice';
import type { FolderNode } from '@/store/slices/sidebarSlice';

interface BottomSection1Props {
  folders: FolderNode[];
  setShowTrashSidebar: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowInviteMembers: (show: boolean) => void;
  setShowManageMembers: (show: boolean) => void;
  onHeightChange: (height: number) => void;
}

const BottomSection1: React.FC<BottomSection1Props> = ({
  folders,
  setShowTrashSidebar,
  setShowSettings,
  setShowInviteMembers,
  setShowManageMembers,
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
  }, [folders.length, trashFolder?.pages.length, onHeightChange]);

  return (
    <div className='flex flex-col gap-2 p-2 w-full' ref={sectionRef}>
      {/* Templates Section */}
      <div className="">
        <button
          onClick={() => router.push('/templates')}
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
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
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <DeleteOutlineIcon className="text-red-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Trash
            {trashFolder && trashFolder.pages.length > 0 ? (
                <span className="ml-1 text-xs text-gray-400">({trashFolder.pages.length})</span>
              ) : null}
          </span>
        </button>
      </div>

      {/* Settings Section */}
      <div className="">
        <button
          onClick={() => setShowSettings(true)}
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <SettingsIcon className="text-gray-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Settings
          </span>
        </button>
      </div>
      {/* Please don't touch below code */}
      <hr className='border-dashed border-white/80 my-2' />

      {/* Invite Members Section */}
      <div className="">
        <button
          onClick={() => setShowInviteMembers(true)}
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <GroupAddIcon className="text-blue-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Invite
          </span>
        </button>
      </div>

      {/* Manage Members Section */}
      <div className="">
        <button
          onClick={() => setShowManageMembers(true)}
          className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
        >
          <span className="flex items-center">
            <PeopleIcon className="text-green-400 text-sm mr-2" style={{ fontSize: '16px' }} />
            Manage members
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomSection1; 