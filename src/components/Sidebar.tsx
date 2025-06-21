'use client';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { addNotePage, updatePageName, updateFolderName, deletePage as deleteFirebasePage, searchPublicNotes, PublicNote } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  loadSidebarData, 
  toggleFolder, 
  renameFolder, 
  renamePage, 
  updatePage, 
  deletePage,
  clearError 
} from '@/store/slices/sidebarSlice';
import type { PageNode } from '@/store/slices/sidebarSlice';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@mui/material';
import Profile from './Profile';
import { useModalStore } from '@/store/modalStore';
import NoteContextMenu from './NoteContextMenu';

interface SidebarProps {
  selectedPageId: string;
  onSelectPage: (id: string) => void;
}

export interface SidebarHandle {
  renamePage: (id: string, name: string) => void;
  updatePage: (oldId: string, newId: string, name: string) => void;
  refreshData: () => void;
}

const Sidebar = forwardRef<SidebarHandle, SidebarProps>(({ selectedPageId, onSelectPage }, ref) => {
  const dispatch = useAppDispatch();
  const { folders, isLoading, error } = useAppSelector((state) => state.sidebar);
  const { showProfile, setShowProfile } = useModalStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PublicNote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const auth = getAuth(firebaseApp);
  const router = useRouter();

  // State for right-click context menu
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; noteId: string | null }>({
    visible: false,
    x: 0,
    y: 0,
    noteId: null,
  });

  // Load data from Redux/Firebase when user authenticates
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !isLoading && folders.length === 0) {
        dispatch(loadSidebarData());
      }
    });

    return unsubscribe;
  }, [auth, dispatch, isLoading, folders.length]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const addNewNoteHandler = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create notes');
      return;
    }

    try {
      // Find the private folder
      const privateFolder = folders.find(f => f.folderType === 'private');
      if (!privateFolder) {
        toast.error('Private folder not found');
        return;
      }

      const pageId = await addNotePage(privateFolder.id, 'Untitled');
      // The note will be automatically organized into the Private folder by the loadSidebarData function
      // since new notes are private by default
      dispatch(loadSidebarData()); // Refresh the sidebar to show the new note
      toast.success('New note created');
      
      // Navigate to the new note
      onSelectPage(pageId);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleToggleFolder = (folderId: string) => {
    dispatch(toggleFolder(folderId));
  };

  const handleDoubleClick = (id: string, currentName: string) => {
    setEditingId(id);
    setTempName(currentName);
  };

  const handleRename = async (id: string) => {
    if (tempName.trim() === '') return;

    try {
      // Check if it's a folder or page
      const isFolder = folders.some(f => f.id === id);
      const isPage = folders.some(f => f.pages.some(p => p.id === id));

      if (isFolder) {
        const folder = folders.find(f => f.id === id);
        // Prevent renaming of default Private and Public folders
        if (folder && (folder.folderType === 'private' || folder.folderType === 'public')) {
          toast.error(`Cannot rename the ${folder.name} folder`);
          setEditingId(null);
          return;
        }
        
        await updateFolderName(id, tempName);
        dispatch(renameFolder({ id, name: tempName }));
        toast.success('Folder renamed');
      } else if (isPage) {
        await updatePageName(id, tempName);
        dispatch(renamePage({ id, name: tempName }));
        toast.success('Page renamed');
      }
    } catch (error) {
      console.error('Error renaming:', error);
      toast.error('Failed to rename');
    } finally {
      setEditingId(null);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to delete pages');
      return;
    }

    const page = folders.flatMap(f => f.pages).find(p => p.id === pageId);
    if (!page) return;

    if (!window.confirm(`Delete page "${page.name}"?`)) return;

    try {
      await deleteFirebasePage(pageId);
      dispatch(deletePage(pageId));
      toast.success('Page deleted');
    } catch (error) {
      console.error('Error deleting page:', error);
      toast.error('Failed to delete page');
    }
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPublicNotes(term, 5); // Limit to 5 for sidebar
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching notes:', error);
      toast.error('Failed to search notes');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchResultClick = (noteId: string) => {
    router.push(`/note/${noteId}`);
    setSearchTerm(''); // Clear search when navigating
    setSearchResults([]);
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showProfile && 
          !target.closest('.profile-dropdown') && 
          !target.closest('.workspace-toggle') &&
          !target.closest('.settings-modal') &&
          !target.closest('.manual-modal') &&
          !target.closest('.workspace-modal') &&
          !target.closest('.invite-members-modal-content') &&
          !target.closest('.manage-members-modal-content') &&
          !target.closest('.notification-center-content')) {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfile, setShowProfile]);

  // Close context menu on outside click or ESC
  useEffect(() => {
    if (!contextMenu.visible) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.note-context-menu')) {
        setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
      }
    };

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu({ visible: false, x: 0, y: 0, noteId: null });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [contextMenu.visible]);

  useImperativeHandle(ref, () => ({
    renamePage: (id: string, name: string) => {
      dispatch(renamePage({ id, name }));
    },
    updatePage: (oldId: string, newId: string, name: string) => {
      dispatch(updatePage({ oldId, newId, name }));
    },
    refreshData: () => {
      dispatch(loadSidebarData());
    },
  }));

  const renderFolder = (folder: { id: string; name: string; isOpen: boolean; folderType?: 'private' | 'public' | 'custom'; pages: PageNode[] }) => {
    const getFolderIcon = (folderType?: string) => {
      switch (folderType) {
        case 'private':
          return '🔒';
        case 'public':
          return '🌐';
        default:
          return '📁';
      }
    };

    const isDefaultFolder = folder.folderType === 'private' || folder.folderType === 'public';

    return (
      <div key={folder.id}>
        <div
          className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${
            folder.isOpen ? 'font-semibold' : ''
          }`}
          onClick={() => handleToggleFolder(folder.id)}
          onDoubleClick={() => !isDefaultFolder && handleDoubleClick(folder.id, folder.name)}
        >
          {editingId === folder.id ? (
            <input
              className="w-full bg-transparent focus:outline-none text-sm"
              aria-label="Folder name"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => handleRename(folder.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(folder.id);
              }}
              autoFocus
            />
          ) : (
            <span>
              {getFolderIcon(folder.folderType)} {folder.name}
              {isDefaultFolder && (
                <span className="ml-1 text-xs text-gray-400">({folder.pages.length})</span>
              )}
            </span>
          )}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Removed add page and delete folder buttons */}
          </div>
        </div>
        {folder.isOpen && (
          <div className="ml-4 mt-1 flex flex-col gap-1">
            {folder.pages.map((page) => (
              <div
                key={page.id}
                className={`group px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${
                  selectedPageId === page.id ? 'bg-black/10 dark:bg-white/10' : ''
                }`}
                onClick={() => onSelectPage(page.id)}
                onDoubleClick={() => handleDoubleClick(page.id, page.name)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ visible: true, x: e.clientX, y: e.clientY, noteId: page.id });
                }}
              >
                {editingId === page.id ? (
                  <input
                    className="w-full bg-transparent focus:outline-none text-sm"
                    aria-label="Page name"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onBlur={() => handleRename(page.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(page.id);
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span>📝</span>
                      <span className="truncate">{page.name}</span>
                    </div>
                    <button
                      className="text-sm px-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete page"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id);
                      }}
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!auth.currentUser) {
    return (
      <aside className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2 bg-[color:var(--background)]">
        <div className="flex items-center justify-center h-32 text-gray-500">
          <span>Please sign in to view workspace</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2 bg-[color:var(--background)]">
      <div className="relative">
        <div className="flex items-center justify-between mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <div className="flex items-center gap-1 cursor-pointer workspace-toggle" onClick={() => setShowProfile(!showProfile)}>
            <span>Workspace</span>
            <span className={`text-xs transition-transform ${showProfile ? 'rotate-180' : ''}`}>▼</span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              title="New note" 
              onClick={addNewNoteHandler} 
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

      {/* Search Bar */}
      <div className="mb-4 px-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search public notes..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full px-3 py-2 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: '#4a5568',
              color: 'white',
              border: 'none',
            }}
          />
          {isSearching && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
            {searchResults.map((note) => (
              <div
                key={note.id}
                onClick={() => handleSearchResultClick(note.id)}
                className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600 last:border-b-0"
              >
                <div className="font-medium text-sm truncate">{note.title}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  By {note.authorName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {isLoading ? (
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
        ) : folders.length === 0 ? (
          <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
            <span>No folders yet. Click ➕ to add one.</span>
          </div>
        ) : (
          folders.map(renderFolder)
        )}
      </nav>

      {/* Note Context Menu */}
      {contextMenu.visible && contextMenu.noteId && (
        <div
          className="fixed z-40 note-context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <NoteContextMenu
            noteId={contextMenu.noteId}
            onClose={() => setContextMenu({ visible: false, x: 0, y: 0, noteId: null })}
          />
        </div>
      )}
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 