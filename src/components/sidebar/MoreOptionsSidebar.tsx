import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import TabForMoreOptionsSidebar from './subComponents/TabForMoreOptionsSidebar'
import CloseIcon from '@mui/icons-material/Close';
import { resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId, tabsForMoreOptionsSidebar } from './common/constants/constants'
import { isNoteFavorite, realTimeFavoriteStatus, realTimePublicStatus } from '@/services/firebase';
import { useAppDispatch } from '@/store/hooks';
interface TabActionParams {
  noteId: string;
  subNoteId?: string;
  isInFavorites: boolean;
  isPublic: boolean;
  dispatch: ReturnType<typeof useAppDispatch>;
  router: ReturnType<typeof useRouter>;
}
interface MoreOptionsSidebarProps {
  selectedNoteId: string;
  selectedSubNoteId?: string;
  folderName: string;
  onClose: () => void;
  offsetY: number;
  onFavoriteChange?: () => void; // Add this callback prop
}

const MoreOptionsSidebar: React.FC<MoreOptionsSidebarProps> = ({ selectedNoteId, selectedSubNoteId, folderName, onClose, offsetY }) => {
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const MoreOptionsSidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkIfNoteIsInFavorites = async () => {
      const isInFavorites = await isNoteFavorite(selectedNoteId);
      setIsInFavorites(isInFavorites);

      const unsubscribeForPublicStatus = await realTimePublicStatus(selectedNoteId, (status) => {
        setIsPublic(status);
      });

      const unsubscribeForFavoriteStatus = await realTimeFavoriteStatus(selectedNoteId, (status) => {
        setIsInFavorites(status);
      });

      return () => {
        if (unsubscribeForPublicStatus && unsubscribeForFavoriteStatus) {
          unsubscribeForPublicStatus();
          unsubscribeForFavoriteStatus();
        }
      }
    }

    checkIfNoteIsInFavorites();
  }, [selectedNoteId, setIsPublic]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (MoreOptionsSidebarRef.current && !MoreOptionsSidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleTabClick = async (tabAction: (params: TabActionParams) => Promise<void>) => {
    if (!tabAction) return;

    await tabAction({ noteId: selectedNoteId, subNoteId: selectedSubNoteId, isInFavorites, isPublic, dispatch, router });
    resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
  }

  return (
    <div className={`w-60 p-2 fixed top-[${offsetY}px] left-60 z-[9999] dark:bg-[#262626] shadow-lg rounded-md overflow-x-visible`} style={{ top: `${offsetY}px` }}>
      {/* <div className='w-60 p-2 absolute top-0 left-0 z-[9999] dark:bg-gray-700 shadow-lg rounded-md overflow-x-visible'> */}
      <div className='text-sm font-semibold flex justify-between items-center mb-2'>
        <span>Page</span>
        <CloseIcon style={{ fontSize: '16px', cursor: 'pointer' }} onClick={onClose} />
      </div>
      {tabsForMoreOptionsSidebar(selectedNoteId, selectedSubNoteId || '', folderName, isPublic, isInFavorites).map((tab, index) => (
        <TabForMoreOptionsSidebar key={index} selectedNoteId={selectedNoteId} selectedSubNoteId={selectedSubNoteId} title={tab.title} icon={tab.icon} onClick={() => handleTabClick(tab.action)} isInFavorites={isInFavorites} />
      ))}
    </div>
  )
}

export default MoreOptionsSidebar;