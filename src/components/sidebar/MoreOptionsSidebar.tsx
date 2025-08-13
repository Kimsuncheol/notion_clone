import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation';
import TabForMoreOptionsSidebar from './subComponents/TabForMoreOptionsSidebar'
import CloseIcon from '@mui/icons-material/Close';
import { resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId, tabsForMoreOptionsSidebar } from './common/constants/constants'
import { isNoteFavorite, realTimeFavoriteStatus, realTimePublicStatus } from '@/services/firebase';
import { useAppDispatch } from '@/store/hooks';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';
import { modalBgColor } from '@/constants/color';

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
  onFavoriteChange?: () => void;
}

const MoreOptionsSidebar: React.FC<MoreOptionsSidebarProps> = ({ 
  selectedNoteId, 
  selectedSubNoteId, 
  folderName, 
  onClose, 
  offsetY 
}) => {
  const [isInFavorites, setIsInFavorites] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { setSelectedSubNoteId } = useAddaSubNoteSidebarStore();
  const [isVisible, setIsVisible] = useState(true); // 즉시 보이도록 변경

  // useRef를 사용한 탭 메모이제이션
  const tabsRef = useRef<ReturnType<typeof tabsForMoreOptionsSidebar> | null>(null);
  const lastParamsRef = useRef<string | null>(null);
  
  // 현재 매개변수들을 문자열로 조합
  const currentParams = `${selectedNoteId}-${selectedSubNoteId || ''}-${folderName}-${isPublic}-${isInFavorites}`;
  
  // 매개변수가 변경되었을 때만 탭을 다시 계산
  if (lastParamsRef.current !== currentParams) {
    tabsRef.current = tabsForMoreOptionsSidebar(
      selectedNoteId, 
      selectedSubNoteId || '', 
      folderName, 
      isPublic, 
      isInFavorites
    );
    lastParamsRef.current = currentParams;
  }

  const tabs = tabsRef.current || [];

  useEffect(() => {
    const checkIfNoteIsInFavorites = async () => {
      try {
        // 병렬로 실행하여 속도 개선
        const [inFav, unsubscribeForPublicStatus, unsubscribeForFavoriteStatus] = await Promise.all([
          isNoteFavorite(selectedNoteId, selectedSubNoteId),
          realTimePublicStatus(selectedNoteId, (status) => {
            setIsPublic(status);
          }),
          realTimeFavoriteStatus(selectedNoteId, (status) => {
            setIsInFavorites(status);
          }, selectedSubNoteId)
        ]);

        setIsInFavorites(inFav);

        // cleanup 함수 반환
        return () => {
          if (unsubscribeForPublicStatus && unsubscribeForFavoriteStatus) {
            unsubscribeForPublicStatus();
            unsubscribeForFavoriteStatus();
          }
        }
      } catch (error) {
        console.error('Error checking note status:', error);
      }
    }

    let cleanup: (() => void) | undefined;
    
    checkIfNoteIsInFavorites().then(cleanupFn => {
      cleanup = cleanupFn;
    });

    // cleanup 반환
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [selectedNoteId, selectedSubNoteId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('#more-options-sidebar') && 
          !target.closest('#more-options-for-subnote') && 
          !target.closest('#more-options-for-note')) {
        onClose();
        setIsVisible(false);
        setSelectedSubNoteId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose, setSelectedSubNoteId]);

  const handleTabClick = async (tabAction: (params: TabActionParams) => Promise<void>) => {
    if (!tabAction) return;

    try {
      await tabAction({ 
        noteId: selectedNoteId, 
        subNoteId: selectedSubNoteId, 
        isInFavorites, 
        isPublic, 
        dispatch, 
        router 
      });
      resetShowMoreOptionsAddaSubNoteSidebarForSelectedNoteId();
    } catch (error) {
      console.error('Error handling tab click:', error);
    }
  }

  return (
    <div 
      className={`w-60 p-2 fixed left-60 z-[9999] rounded-md ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-50`} 
      style={{ top: `${offsetY}px`, backgroundColor: modalBgColor }} 
      id='more-options-sidebar'
    >
      <div className='text-sm font-semibold flex justify-between items-center mb-2'>
        <span>Page</span>
        <CloseIcon 
          style={{ fontSize: '16px', cursor: 'pointer' }} 
          onClick={onClose} 
        />
      </div>
      {tabs.map((tab, index) => (
        <TabForMoreOptionsSidebar 
          key={tab.id || `tab-${index}`} // 더 안정적인 key 사용
          selectedNoteId={selectedNoteId} 
          selectedSubNoteId={selectedSubNoteId} 
          title={tab.title} 
          icon={tab.icon} 
          onClick={() => handleTabClick(tab.action)} 
          isInFavorites={isInFavorites} 
          isSubNote={!!selectedSubNoteId} 
        />
      ))}
    </div>
  )
}

export default MoreOptionsSidebar;