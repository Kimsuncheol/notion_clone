import React from 'react';
import { useRouter } from 'next/navigation';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { getFolderByType } from '@/store/slices/sidebarSlice';
import type { PageNode } from '@/store/slices/sidebarSlice';

interface BottomMenuProps {
  folders: { id: string; name: string; isOpen: boolean; folderType?: 'private' | 'public' | 'custom' | 'trash'; pages: PageNode[] }[];
  setShowTrashSidebar: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowInviteMembers: (show: boolean) => void;
  setShowManageMembers: (show: boolean) => void;
  setShowCalendarModal: (show: boolean) => void;
  setShowHelpContactMore: (show: boolean) => void;
}

const BottomMenu: React.FC<BottomMenuProps> = ({
  folders,
  setShowTrashSidebar,
  setShowSettings,
  setShowInviteMembers,
  setShowManageMembers,
  setShowCalendarModal,
  setShowHelpContactMore,
}) => {
  const router = useRouter();
  const trashFolder = getFolderByType(folders, 'trash');

  return (
    <>
      <div className='flex flex-col gap-2 absolute bottom-20 left-0 p-2 w-full' id='bottom-section1'>
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
      <div className='w-full p-4 border-t border-t-gray-600 absolute bottom-0 left-0 flex items-center justify-between' id='bottom-section2'>
        <div
          onClick={() => setShowCalendarModal(true)}
          className="w-8 h-8 p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm flex items-center justify-center"
          title="Open Calendar"
        >
          <CalendarMonthIcon style={{ fontSize: '16px' }} />
        </div>
        {/* Don't touch below code */}
        <div
          id='help-contact-more-button'
          onClick={() => setShowHelpContactMore(true)}
          className='w-8 h-8 p-1 rounded-full border-white border-1 text-white text-sm flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors'>
          <QuestionMarkIcon style={{ fontSize: '16px' }} />
        </div>
      </div>
    </>
  );
};

export default BottomMenu; 