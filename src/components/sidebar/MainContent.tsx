import React, { useRef, useEffect, useState } from 'react';
import { FavoriteNote } from '@/services/firebase';
import { FolderNode } from '@/store/slices/sidebarSlice';
import FavoritesList from './common/FavoritesList';
import FolderTree from './common/FolderTree';
import BottomSection1 from './common/BottomSection1';

interface MainContentProps {
  // Props for FavoritesList
  favoriteNotes: FavoriteNote[];
  isLoadingFavorites: boolean;

  // Props for FolderTree
  folders: FolderNode[];
  editingId: string | null;
  tempName: string;
  hoveredFolderId: string | null;
  onToggleFolder: (folderId: string) => void;
  onDoubleClick: (id: string, currentName: string) => void;
  onRename: (id: string) => void;
  onSetTempName: (name: string) => void;
  onSetHoveredFolderId: (id: string | null) => void;
  onContextMenu: (e: React.MouseEvent, noteId: string) => void;
  isDefaultFolder: (folderType?: 'private' | 'public' | 'custom' | 'trash') => boolean;

  // Props for BottomSection1
  setShowTrashSidebar: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  onBottomSection1HeightChange: (height: number) => void;

  // Common props
  selectedPageId: string;
  onPageClick: (pageId: string) => void;
  isLoading: boolean;
  onHeightChange: (height: number) => void;
  shouldScroll: boolean;
}

const MainContent: React.FC<MainContentProps> = (props) => {
  const mainContentRef = useRef<HTMLDivElement | null>(null);
  const [mainContentHeight, setMainContentHeight] = useState(0);
  useEffect(() => {
    if (mainContentRef.current) {
      const height = mainContentRef.current.offsetHeight;
      setMainContentHeight(height);
      console.log(`MainContent height: ${height}px`);
      props.onHeightChange(height);
    }
  }, [props, mainContentHeight]);

  return (
    <div className={`flex flex-col gap-2 justify-between flex-grow fixed left-0 top-[140px] bottom-[100px] w-60 ${props.shouldScroll ? 'overflow-y-auto' : ''}`} ref={mainContentRef} id='main-content'>
      <div className='flex flex-col gap-2 p-2' id='main-content-inner'>
        <FavoritesList
          favoriteNotes={props.favoriteNotes}
          isLoadingFavorites={props.isLoadingFavorites}
          selectedPageId={props.selectedPageId}
          onPageClick={props.onPageClick}
        />
        <FolderTree
          folders={props.folders}
          isLoading={props.isLoading}
          selectedPageId={props.selectedPageId}
          editingId={props.editingId}
          tempName={props.tempName}
          hoveredFolderId={props.hoveredFolderId}
          onToggleFolder={props.onToggleFolder}
          onDoubleClick={props.onDoubleClick}
          onRename={props.onRename}
          onSetTempName={props.onSetTempName}
          onSetHoveredFolderId={props.onSetHoveredFolderId}
          onPageClick={props.onPageClick}
          onContextMenu={props.onContextMenu}
          isDefaultFolder={props.isDefaultFolder}
          mainContentHeight={mainContentHeight}
        />
      </div>
      <BottomSection1
        folders={props.folders}
        setShowTrashSidebar={props.setShowTrashSidebar}
        setShowSettings={props.setShowSettings}
        onHeightChange={props.onBottomSection1HeightChange}
      />
    </div>
  );
};

export default MainContent; 