'use client';
import React, { useRef, useEffect, useState } from 'react';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { FolderNode, NoteNode } from '@/store/slices/sidebarSlice';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AddIcon from '@mui/icons-material/Add';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import SkeletonForFolderTree from './skeletonUI/skeletonForFolderTree';
import { useRouter } from 'next/navigation';
import { useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore } from '@/store/showMoreOptions-AddaSubNoteSidebarForSelectedNoteIdStore';
import { getPositionById } from '../utils/offsetUtils';
import { useOffsetStore } from '@/store/offsetStore';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';

interface FolderTreeProps {
  folders: FolderNode[];
  isLoading: boolean;
  selectedPageId: string;
  editingId: string | null;
  tempName: string;
  hoveredFolderId: string | null;
  onToggleFolder: (folderId: string) => void;
  onDoubleClick: (id: string, name: string) => void;
  onRename: (id: string) => void;
  onSetTempName: (name: string) => void;
  onSetHoveredFolderId: (id: string | null) => void;
  onPageClick: (pageId: string) => void;
  onContextMenu: (e: React.MouseEvent, noteId: string) => void;
  isDefaultFolder: (folderType?: 'private' | 'public' | 'custom' | 'trash') => boolean;
  mainContentHeight: number;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  isLoading,
  selectedPageId,
  editingId,
  tempName,
  hoveredFolderId,
  onToggleFolder,
  onDoubleClick,
  onRename,
  onSetTempName,
  onSetHoveredFolderId,
  onPageClick,
  onContextMenu,
  isDefaultFolder,
  mainContentHeight,
}) => {
  const folderRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [onHoveredPageId, setOnHoveredPageId] = useState<string | null>(null);
  const router = useRouter();
  const {
    // showMoreOptionsSidebarForFolderTree,
    // showAddaSubNoteSidebarForFolderTree,
    // resetShowMoreOptionsSidebarForFolderTree,
    // resetShowAddaSubNoteSidebarForFolderTree,
    toggleShowMoreOptionsAddaSubNoteSidebar
  } = useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore();
  const { setOffset } = useOffsetStore();

  useEffect(() => {
    folders.forEach(folder => {
      if (folder.isOpen) {
        const folderElement = folderRefs.current[folder.id];
        if (folderElement) {
          const height = folderElement.offsetHeight;
          console.log(`Folder "${folder.name}" height: ${height}px`);
          console.log(`Folder "${folder.name}" height / mainContentHeight: ${(height / mainContentHeight) * 100}%`);
        }
      }
    });
  }, [folders, mainContentHeight]);

  const renderFolder = (folder: FolderNode) => {
    const getFolderIcon = (folderType?: string, isHovered?: boolean) => {
      switch (folderType) {
        case 'private':
          return <LockIcon style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }} />;
        case 'public':
          return <PublicIcon style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }} />;
        case 'trash':
          return (
            <DeleteOutlineIcon
              style={{ fontSize: '16px', color: isHovered ? 'gray' : 'white' }}
            />
          );
        default:
          return '📁';
      }
    };

    const isFolderDefault = isDefaultFolder(folder.folderType);
    const isHovered = hoveredFolderId === folder.id;

    const handleFolderClick = () => {
      onToggleFolder(folder.id);
    };

    return (
      <div key={folder.id} ref={el => { folderRefs.current[folder.id] = el; }}>
        <div
          className={`group flex items-center justify-between px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${folder.isOpen ? 'font-semibold' : ''
            }`}
          onClick={handleFolderClick}
          onDoubleClick={() => !isFolderDefault && onDoubleClick(folder.id, folder.name)}
          onMouseEnter={() => onSetHoveredFolderId(folder.id)}
          onMouseLeave={() => onSetHoveredFolderId(null)}
        >
          <div className="flex items-center gap-2 text-sm">
            {getFolderIcon(folder.folderType, isHovered)} {folder.name}
          </div>
        </div>
        {folder.isOpen && (
          <div className={`ml-4 mt-1 flex flex-col gap-1 ${folder.folderType === 'trash' ? 'trash-folder-content' : ''}`}>
            {folder.notes.map((note: NoteNode) => (
              <div
                key={note.id}
                className={`group relative px-2 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === note.id ? 'bg-black/10 dark:bg-white/10' : ''}`}
                onMouseEnter={() => setOnHoveredPageId(note.id)}
                onMouseLeave={() => setOnHoveredPageId(null)}
                onDoubleClick={() => onDoubleClick(note.id, note.name)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onContextMenu(e, note.id);
                }}
              >
                {editingId === note.id ? (
                  <input
                    className="w-full bg-transparent focus:outline-none text-sm"
                    aria-label="Page name"
                    value={tempName}
                    onChange={(e) => onSetTempName(e.target.value)}
                    onBlur={() => onRename(note.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onRename(note.id);
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0"
                      onClick={() => {
                        onPageClick(note.id);
                        router.push(`/note/${note.id}`);
                      }}
                      id={note.id + 'note'}
                    >
                      {onHoveredPageId === note.id ? (
                        <ArrowForwardIosIcon style={{ fontSize: '12px' }} />
                      ) : (
                        <TextSnippetIcon style={{ fontSize: '12px' }} />
                      )}
                      <span className="truncate">{note.name}</span>
                    </div>
                    {onHoveredPageId === note.id && (
                      <div className="flex items-center gap-1">
                        <MoreHorizIcon style={{ fontSize: '12px' }} onClick={() => {
                          const offset = getPositionById(note.id + 'note');
                          setOffset(offset.x, offset.y);
                          toggleShowMoreOptionsAddaSubNoteSidebar(null, null, note.id, null);
                        }} />
                        <AddIcon style={{ fontSize: '12px' }} onClick={() => {
                          const offset = getPositionById(note.id + 'note');
                          setOffset(offset.x, offset.y);
                          toggleShowMoreOptionsAddaSubNoteSidebar(null, null, null, note.id);
                        }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <SkeletonForFolderTree />;
  }

  if (folders.length === 0) {
    return (
      <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
        <span>No folders yet. Click ➕ to add one.</span>
      </div>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {folders.filter((folder: FolderNode) => folder.folderType !== 'trash').map(renderFolder)}
    </nav>
  );
};

export default FolderTree; 