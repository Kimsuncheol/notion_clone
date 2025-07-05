'use client';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { addNotePage, updatePageName, updateFolderName, updateNoteRecentlyOpen } from '@/services/firebase';
import { getUserFavorites, removeFromFavorites, FavoriteNote } from '@/services/firebase';
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
  clearError,
  getFolderByType,
  isDefaultFolder,
  updateNoteOrder
} from '@/store/slices/sidebarSlice';
import type { PageNode } from '@/store/slices/sidebarSlice';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@mui/material';
import { useModalStore } from '@/store/modalStore';
import NoteContextMenu from './NoteContextMenu';
import SearchModal from './SearchModal';
import SettingsComponent from './SettingsComponent';
import InviteMembersSidebar from './InviteMembersSidebar';
import ManageMembersSidebar from './ManageMembersSidebar';
import HelpContactMoreSidebar from './HelpContactMoreSidebar';
import BottomMenu from './sidebar/BottomMenu';
import WorkspaceHeader from './sidebar/WorkspaceHeader';
import TrashSidebar from './TrashSidebar';

import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import InboxIcon from '@mui/icons-material/Inbox';
import HomeIcon from '@mui/icons-material/Home';

import CalendarModal from './CalendarModal';
import NotesArchiveModal from './NotesArchiveModal';
import { Dayjs } from 'dayjs';
import { blueBackgroundColor } from '@/themes/backgroundColor';
import Link from 'next/link';

interface SidebarProps {
  selectedPageId: string;
  onSelectPage: (id: string) => void;
}

export interface SidebarHandle {
  renamePage: (id: string, name: string) => void;
  updatePage: (oldId: string, newId: string, name: string) => void;
  refreshData: () => void;
  refreshFavorites: () => void;
}

const Sidebar = forwardRef<SidebarHandle, SidebarProps>(({ selectedPageId, onSelectPage }, ref) => {
  const dispatch = useAppDispatch();
  const { folders, isLoading, error } = useAppSelector((state) => state.sidebar);
  const {
    setShowInbox,
    unreadNotificationCount,
    showSearchModal,
    setShowSearchModal,
    showSettings,
    setShowSettings,
    showInviteMembers,
    setShowInviteMembers,
    showManageMembers,
    setShowManageMembers
  } = useModalStore();
  const [showProfile, setShowProfile] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState<string>('');
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const blueBackground = blueBackgroundColor;

  // State for right-click context menu
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; noteId: string | null }>({
    visible: false,
    x: 0,
    y: 0,
    noteId: null,
  });

  // Favorites state
  const [favoriteNotes, setFavoriteNotes] = useState<FavoriteNote[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

  // Trash sidebar state
  const [showTrashSidebar, setShowTrashSidebar] = useState(false);

  // Calendar modal state
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Notes archive modal state
  const [showNotesArchive, setShowNotesArchive] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  // Help Contact More sidebar state
  const [showHelpContactMore, setShowHelpContactMore] = useState(false);

  // Folder hover states
  const [hoveredFolderId, setHoveredFolderId] = useState<string | null>(null);

  // Load data from Redux/Firebase when user authenticates
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && !isLoading && folders.length === 0) {
        dispatch(loadSidebarData());
      }
    });

    return unsubscribe;
  }, [auth, dispatch, isLoading, folders.length]);

  // Load favorites when user authenticates
  useEffect(() => {
    const loadFavorites = async () => {
      if (auth.currentUser) {
        setIsLoadingFavorites(true);
        try {
          const favorites = await getUserFavorites();
          setFavoriteNotes(favorites);
        } catch (error) {
          console.error('Error loading favorites:', error);
        } finally {
          setIsLoadingFavorites(false);
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadFavorites();
      } else {
        setFavoriteNotes([]);
      }
    });

    return unsubscribe;
  }, [auth]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const addNewNoteHandler = async (mode: 'general' | 'markdown' = 'general') => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create notes');
      return;
    }

    try {
      // Find the private folder using utility function
      const privateFolder = getFolderByType(folders, 'private');
      if (!privateFolder) {
        toast.error('Private folder not found');
        return;
      }

      const pageId = await addNotePage(privateFolder.id, 'Untitled');
      // The note will be automatically organized into the Private folder by the loadSidebarData function
      // since new notes are private by default
      dispatch(loadSidebarData()); // Refresh the sidebar to show the new note
      toast.success(`New ${mode} note created`);

      // Navigate to the new note with the selected mode
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
        // Prevent renaming of default folders using utility function
        if (folder && isDefaultFolder(folder.folderType)) {
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

  // Handle remove from favorites
  const handleRemoveFromFavorites = async (noteId: string) => {
    try {
      await removeFromFavorites(noteId);
      setFavoriteNotes(prev => prev.filter(fav => fav.noteId !== noteId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  // Handle trash operations
  // Calendar handlers
  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setShowCalendarModal(false);
    setShowNotesArchive(true);
  };

  const handleBackToCalendar = () => {
    setShowNotesArchive(false);
    setShowCalendarModal(true);
  };

  const handleNoteSelect = (noteId: string) => {
    // Close all modals first
    setShowNotesArchive(false);
    setShowCalendarModal(false);

    // Navigate to the note
    onSelectPage(noteId);
    router.push(`/note/${noteId}`);
  };

  const handlePageClick = async (pageId: string) => {
    try {
      dispatch(updateNoteOrder({ pageId }));
      onSelectPage(pageId);
      
      await updateNoteRecentlyOpen(pageId);
    } catch (error) {
      console.error('Error handling page click:', error);
      toast.error('Could not open note.');
    }
  };

  const refreshData = () => {
    dispatch(loadSidebarData());
    // Also refresh favorites
    if (auth.currentUser) {
      getUserFavorites()
        .then(setFavoriteNotes)
        .catch(error => console.error('Error refreshing favorites:', error));
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
      // Also refresh favorites
      if (auth.currentUser) {
        getUserFavorites()
          .then(setFavoriteNotes)
          .catch(error => console.error('Error refreshing favorites:', error));
      }
    },
    refreshFavorites: () => {
      if (auth.currentUser) {
        getUserFavorites()
          .then(setFavoriteNotes)
          .catch(error => console.error('Error refreshing favorites:', error));
      }
    },
  }));

  const renderFolder = (folder: { id: string; name: string; isOpen: boolean; folderType?: 'private' | 'public' | 'custom' | 'trash'; pages: PageNode[] }) => {
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
      handleToggleFolder(folder.id);
    };

    const handleTrashDropdownClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Open the trash folder if it's not already open
      if (!folder.isOpen) {
        handleToggleFolder(folder.id);
      }

      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        noteId: folder.id
      });
    };

    return (
      <div key={folder.id}>
        <div
          className={`group flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 ${folder.isOpen ? 'font-semibold' : ''
            }`}
          onClick={handleFolderClick}
          onDoubleClick={() => !isFolderDefault && handleDoubleClick(folder.id, folder.name)}
          onMouseEnter={() => setHoveredFolderId(folder.id)}
          onMouseLeave={() => setHoveredFolderId(null)}
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
            {folder.pages.map((page) => (
              <Link
                prefetch={true}
                href={`/note/${page.id}`}
                key={page.id}
                className={`group px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === page.id ? 'bg-black/10 dark:bg-white/10' : ''
                  }`}
                onClick={() => {
                  handlePageClick(page.id);
                }}
                onDoubleClick={() => handleDoubleClick(page.id, page.name)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({
                    visible: true,
                    x: e.clientX,
                    y: e.clientY,
                    noteId: page.id
                  });
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
                      <NoteAltIcon className="text-sm" />   {/* TODO: Don't touch this */}
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

  if (!auth.currentUser) {
    return (
      <aside className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2 bg-[color:var(--background)]">
        <div className="flex items-center justify-center h-32 text-gray-500">
          <span>Please sign in to view workspace</span>
          <button onClick={() => router.push('/signin')}>Sign in</button>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className={`sticky top-0 w-60 h-screen shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2 ${blueBackground} flex flex-col justify-between`}>
        <div className='flex flex-col gap-2'>
          <WorkspaceHeader
            showProfile={showProfile}
            setShowProfile={setShowProfile}
            addNewNoteHandler={addNewNoteHandler}
            isLoading={isLoading}
          />

          <nav className="flex flex-col gap-1">
            {/* Search Bar */}
            {/* Please don't touch below code */}
            <div className="flex items-center px-2 py-1 text-sm font-semibold tracking-wide text-white" onClick={() => setShowSearchModal(true)}>
              <SearchIcon />
              <span>Search</span>
            </div>   {/* Please don't touch below code */}
            {/* Inbox Section */}
            <div className="">   {/* Please don't touch below code */}
              <button
                onClick={() => setShowInbox(true)}
                className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
              >
                <span className="flex items-center">
                  <InboxIcon className="text-blue-400 text-sm mr-2" style={{ fontSize: '16px' }} />
                  Inbox
                  {unreadNotificationCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadNotificationCount}
                    </span>
                  )}
                </span>
              </button>
            </div>

            {/* Home Section */}
            {/* Please don't touch below code */}
            <div className="mb-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-left"
              >
                <span className="flex items-center">
                  <HomeIcon className="text-green-400 text-sm mr-2" style={{ fontSize: '16px' }} />
                  Dashboard
                </span>
              </button>
            </div>

            {/* Favorites Section */}
            {/* Please don't touch below code */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 font-semibold">
                <span>
                  <StarIcon className="text-yellow-500 text-sm" style={{ fontSize: '16px' }} /> Your Favorites
                  <span className="ml-1 text-xs text-gray-400">({favoriteNotes.length})</span>
                </span>
              </div>
              <div className="ml-4 mt-1 flex flex-col gap-1">
                {favoriteNotes.length > 0 ? (
                  favoriteNotes.map((favorite) => (
                    <div
                      key={favorite.id}
                      className={`group px-2 py-1 rounded cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 text-sm flex items-center justify-between ${selectedPageId === favorite.noteId ? 'bg-black/10 dark:bg-white/10' : ''
                        }`}
                      onClick={() => {
                        handlePageClick(favorite.noteId);
                      }}
                    >
                      <div className=" flex items-center gap-2 flex-1 min-w-0">
                        <StarIcon className="text-yellow-500 text-sm" style={{ fontSize: '14px' }} />
                        <span className="truncate">{favorite.noteTitle}</span>
                      </div>
                      <button
                        className="text-sm px-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from favorites"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFavorites(favorite.noteId);
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  !isLoadingFavorites && (
                    <div className="px-2 py-1 text-xs text-gray-500 italic">
                      No favorites yet
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Loading state for favorites */}
            {isLoadingFavorites && (
              <div className="mb-4">
                <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
                <div className="ml-4 flex flex-col gap-1 mt-1">
                  <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
                  <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
                </div>
              </div>
            )}

            {/* Folders Section */}
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
              folders.filter(folder => folder.folderType !== 'trash').map(renderFolder)
            )}
          </nav>
        </div>

        <BottomMenu
          folders={folders}
          setShowTrashSidebar={setShowTrashSidebar}
          setShowSettings={setShowSettings}
          setShowInviteMembers={setShowInviteMembers}
          setShowManageMembers={setShowManageMembers}
          setShowCalendarModal={setShowCalendarModal}
          setShowHelpContactMore={setShowHelpContactMore}
        />
      </aside>

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

      {/* Trash Sidebar */}
      <TrashSidebar
        open={showTrashSidebar}
        onClose={() => setShowTrashSidebar(false)}
        trashFolder={folders.find(f => f.folderType === 'trash')}
        onRefreshData={refreshData}
      />

      {/* Search Modal */}
      <SearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Settings Modal */}
      {showSettings && (
        <SettingsComponent onClose={() => setShowSettings(false)} />
      )}

      {/* Invite Members Sidebar */}
      <InviteMembersSidebar
        open={showInviteMembers}
        onClose={() => setShowInviteMembers(false)}
      />

      {/* Manage Members Sidebar */}
      <ManageMembersSidebar
        open={showManageMembers}
        onClose={() => setShowManageMembers(false)}
      />

      {/* Calendar Modal */}
      <CalendarModal
        open={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        onDateSelect={handleDateSelect}
      />

      {/* Notes Archive Modal */}
      <NotesArchiveModal
        open={showNotesArchive}
        onClose={() => setShowNotesArchive(false)}
        onBackToCalendar={handleBackToCalendar}
        selectedDate={selectedDate}
        onNoteSelect={handleNoteSelect}
      />

      {/* Help Contact More Sidebar */}
      <HelpContactMoreSidebar
        open={showHelpContactMore}
        onClose={() => setShowHelpContactMore(false)}
      />
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 