import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Skeleton } from '@mui/material';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageNode, FolderNode } from '@/store/slices/sidebarSlice';

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
          return '🔒';
        case 'public':
          return '🌐';
        case 'trash':
          return (
            <DeleteOutlineIcon
              fontSize="small"
              className={isHovered ? 'text-gray-600' : 'text-white'}
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

    const handleTrashDropdownClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!folder.isOpen) {
        onToggleFolder(folder.id);
      }

      onContextMenu(e, folder.id);
    };

    return (
      <div key={folder.id} ref={el => { folderRefs.current[folder.id] = el; }}>
        <div
          className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${folder.isOpen ? 'font-semibold' : ''
            }`}
          onClick={handleFolderClick}
          onDoubleClick={() => !isFolderDefault && onDoubleClick(folder.id, folder.name)}
          onMouseEnter={() => onSetHoveredFolderId(folder.id)}
          onMouseLeave={() => onSetHoveredFolderId(null)}
        >
          {editingId === folder.id ? (
            <input
              className="w-full bg-transparent focus:outline-none text-sm"
              aria-label="Folder name"
              value={tempName}
              onChange={(e) => onSetTempName(e.target.value)}
              onBlur={() => onRename(folder.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onRename(folder.id);
              }}
              autoFocus
            />
          ) : (
            <span>
              {getFolderIcon(folder.folderType, isHovered)} {folder.name}
              {isFolderDefault && (
                <span className="ml-1 text-xs text-gray-400">({folder.pages.length})</span>
              )}
            </span>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {folder.folderType === 'trash' && (
              <button
                onClick={handleTrashDropdownClick}
                className="text-sm px-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-600 dark:text-gray-400"
                title="Trash options"
              >
                ⚙️
              </button>
            )}
          </div>
        </div>
        {folder.isOpen && (
          <div className={`ml-4 mt-1 flex flex-col gap-1 ${folder.folderType === 'trash' ? 'trash-folder-content' : ''}`}>
            {folder.pages.map((page: PageNode) => (
              <Link
                prefetch={true}
                href={`/note/${page.id}`}
                key={page.id}
                className={`group px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === page.id ? 'bg-black/10 dark:bg-white/10' : ''
                  }`}
                onClick={() => {
                  onPageClick(page.id);
                }}
                onDoubleClick={() => onDoubleClick(page.id, page.name)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onContextMenu(e, page.id);
                }}
              >
                {editingId === page.id ? (
                  <input
                    className="w-full bg-transparent focus:outline-none text-sm"
                    aria-label="Page name"
                    value={tempName}
                    onChange={(e) => onSetTempName(e.target.value)}
                    onBlur={() => onRename(page.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onRename(page.id);
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <NoteAltIcon className="text-sm" />
                      <span className="truncate">{page.name}</span>
                    </div>
                  </>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-2">
        <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
        <div className="ml-4 flex flex-col gap-1">
          <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="80%" height={24} sx={{ borderRadius: 1 }} />
        </div>
        <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
        <div className="ml-4 flex flex-col gap-1">
          <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
        </div>
      </div>
    );
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