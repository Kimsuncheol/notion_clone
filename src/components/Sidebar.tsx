'use client';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { addFolder as addFirebaseFolder, addNotePage, updatePageName, updateFolderName, deleteFolder as deleteFirebaseFolder, deletePage as deleteFirebasePage } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
  loadSidebarData, 
  addFolder, 
  addPage, 
  toggleFolder, 
  renameFolder, 
  renamePage, 
  updatePage, 
  deleteFolder, 
  deletePage,
  clearError 
} from '@/store/slices/sidebarSlice';
import type { PageNode } from '@/store/slices/sidebarSlice';

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');
  const auth = getAuth(firebaseApp);

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

  const addFolderHandler = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create folders');
      return;
    }

    try {
      const id = await addFirebaseFolder('New folder');
      dispatch(addFolder({ id, name: 'New folder' }));
      setEditingId(id);
      setTempName('New folder');
      toast.success('Folder created');
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const addPageHandler = async (folderId: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create pages');
      return;
    }

    try {
      const pageId = await addNotePage(folderId, 'Untitled');
      dispatch(addPage({ folderId, id: pageId, name: 'Untitled' }));
      toast.success('Page created');
    } catch (error) {
      console.error('Error creating page:', error);
      toast.error('Failed to create page');
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

  const handleDeleteFolder = async (folderId: string) => {
    if (!auth.currentUser) {
      toast.error('Please sign in to delete folders');
      return;
    }

    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    const confirmMessage = folder.pages.length > 0 
      ? `Delete "${folder.name}" and all ${folder.pages.length} pages inside it?`
      : `Delete folder "${folder.name}"?`;

    if (!window.confirm(confirmMessage)) return;

    try {
      await deleteFirebaseFolder(folderId);
      dispatch(deleteFolder(folderId));
      toast.success('Folder deleted');
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast.error('Failed to delete folder');
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

  const renderFolder = (folder: { id: string; name: string; isOpen: boolean; pages: PageNode[] }) => (
    <div key={folder.id}>
      <div
        className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${
          folder.isOpen ? 'font-semibold' : ''
        }`}
        onClick={() => handleToggleFolder(folder.id)}
        onDoubleClick={() => handleDoubleClick(folder.id, folder.name)}
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
          <span>📁 {folder.name}</span>
        )}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="text-sm px-1 hover:bg-black/10 dark:hover:bg-white/20 rounded"
            title="Add page"
            onClick={(e) => {
              e.stopPropagation();
              addPageHandler(folder.id);
            }}
          >
            ➕
          </button>
          <button
            className="text-sm px-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400"
            title="Delete folder"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteFolder(folder.id);
            }}
          >
            🗑️
          </button>
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
      <div className="flex items-center justify-between mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>Workspace</span>
        <button title="Add folder" onClick={addFolderHandler} className="text-lg" disabled={isLoading}>
          ➕
        </button>
      </div>
      <nav className="flex flex-col gap-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-gray-500">
            <span>Loading...</span>
          </div>
        ) : folders.length === 0 ? (
          <div className="flex items-center justify-center py-4 text-gray-500 text-sm">
            <span>No folders yet. Click ➕ to add one.</span>
          </div>
        ) : (
          folders.map(renderFolder)
        )}
      </nav>
    </aside>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 