'use client';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { addNotePage, updateFolderName, updateNoteRecentlyOpen, subscribeToFavorites, changeNoteTitle } from '@/services/firebase';
import { FavoriteNote } from '@/types/firebase';
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
  updateNoteOrder,
  FolderNode,
} from '@/store/slices/sidebarSlice';
import { useRouter } from 'next/navigation';
import { useModalStore } from '@/store/modalStore';
import NoteContextMenu from './NoteContextMenu';
import SearchModal from './SearchModal';
import SettingsComponent from './SettingsComponent';
import InviteMembersSidebar from './InviteMembersSidebar';
import ManageMembersSidebar from './ManageMembersSidebar';
import HelpContactMoreSidebar from './HelpContactMoreSidebar';
import BottomMenu from './sidebar/BottomMenu';
import TrashSidebar from './TrashSidebar';
import CalendarModal from './CalendarModal';
import NotesArchiveModal from './NotesArchiveModal';
import { Dayjs } from 'dayjs';
import { blueBackgroundColor } from '@/themes/backgroundColor';
import MainContent from './sidebar/MainContent';
import TopSection from './sidebar/TopSection';
import MoreOptionsSidebar from './sidebar/MoreOptionsSidebar';
import { useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore } from '@/store/showMoreOptions-AddaSubNoteSidebarForSelectedNoteIdStore';
import AddaSubNoteSidebar from './sidebar/AddaSubNoteSidebar';
import { useOffsetStore } from '@/store/offsetStore';

// Skeleton Components
/**
 * TopSectionSkeleton - Skeleton for workspace header, search bar, and new note button
 * Shows during initial auth loading and main data loading
 */
const TopSectionSkeleton = () => (
  <div className="flex flex-col space-y-3 mb-4">
    {/* Workspace Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 animate-pulse"></div>
      </div>
      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
    </div>

    {/* Search and Actions Skeleton */}
    <div className="flex items-center space-x-2">
      <div className="flex-1 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
    </div>

    {/* New Note Button Skeleton */}
    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
  </div>
);

/**
 * FolderSkeleton - Skeleton for individual folder with expandable pages
 * Shows folder icon, name, and nested page structure
 */
const FolderSkeleton = () => (
  <div className="space-y-1">
    {/* Folder Header */}
    <div className="flex items-center space-x-2 px-2 py-1">
      <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20 animate-pulse"></div>
    </div>

    {/* Folder Pages */}
    <div className="ml-4 space-y-1">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="flex items-center space-x-2 px-2 py-1">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * FavoritesSkeleton - Skeleton for favorites section header and favorite notes
 * Shows star icon, "Your Favorites" text, and favorite note list
 */
const FavoritesSkeleton = () => (
  <div className="space-y-2 mb-4">
    <div className="flex items-center space-x-2 px-2">
      <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
    </div>
    <div className="ml-4 space-y-1">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="flex items-center space-x-2 px-2 py-1">
          <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-28 animate-pulse"></div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * MainContentSkeleton - Skeleton for main content area with favorites and folders
 * Combines favorites and folder skeletons in scrollable container
 */
const MainContentSkeleton = () => (
  <div className="flex-1 overflow-hidden">
    <div className="h-full overflow-y-auto px-2 space-y-4">
      {/* Favorites Skeleton */}
      <FavoritesSkeleton />

      {/* Folders Skeleton */}
      {[...Array(3)].map((_, index) => (
        <FolderSkeleton key={index} />
      ))}
    </div>
  </div>
);

/**
 * BottomMenuSkeleton - Skeleton for bottom menu with calendar and help icons
 * Shows action buttons at the bottom of the sidebar
 */
const BottomMenuSkeleton = () => (
  <div className="flex items-center justify-between px-2 py-2 border-t border-black/10 dark:border-white/10">
    <div className="flex items-center space-x-2">
      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
    </div>
    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
  </div>
);

/**
 * SidebarSkeleton - Complete sidebar skeleton component
 * Used during initial auth loading and main data loading
 * Combines all skeleton components to match the sidebar structure
 */
const SidebarSkeleton = () => {
  const blueBackground = blueBackgroundColor;

  return (
    <aside className={`sticky top-0 w-60 h-screen shrink-0 border-r border-black/10 dark:border-white/10 py-2 px-2 ${blueBackground} flex flex-col`}>
      <TopSectionSkeleton />
      <MainContentSkeleton />
      <BottomMenuSkeleton />
    </aside>
  );
};

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

  // State for component heights
  const [mainContentHeight, setMainContentHeight] = useState(0);
  const [bottomSection1Height, setBottomSection1Height] = useState(0);
  const [bottomMenuHeight, setBottomMenuHeight] = useState(0);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 0);

  // Auth state
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const {
    showMoreOptionsSidebarForFavorites,
    showAddaSubNoteSidebarForFavorites,
    showMoreOptionsSidebarForFolderTree,
    showAddaSubNoteSidebarForFolderTree,
    resetShowMoreOptionsSidebarForFavorites,
    resetShowAddaSubNoteSidebarForFavorites,
    resetShowMoreOptionsSidebarForFolderTree,
    resetShowAddaSubNoteSidebarForFolderTree,
  } = useShowMoreOptionsAddaSubNoteSidebarForSelectedNoteIdStore();
  const { offsetY } = useOffsetStore();

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data from Redux/Firebase when user authenticates
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthLoading(false);
      if (user && !isLoading && folders.length === 0) {
        dispatch(loadSidebarData());
      }
    });

    return unsubscribe;
  }, [auth, dispatch, isLoading, folders.length]);

  // Load favorites when user authenticates (now with real-time listener)
  useEffect(() => {
    let unsubscribeFavorites: (() => void) | undefined;

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (unsubscribeFavorites) {
        unsubscribeFavorites();
      }

      if (user) {
        setIsLoadingFavorites(true);
        unsubscribeFavorites = subscribeToFavorites((favorites) => {
          setFavoriteNotes(favorites);
          setIsLoadingFavorites(false);
        });
      } else {
        setFavoriteNotes([]);
        setIsLoadingFavorites(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFavorites) {
        unsubscribeFavorites();
      }
    };
  }, [auth]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const addNewNoteHandler = async (mode: 'markdown') => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create notes');
      return;
    }
    console.log('folders:', folders);
    
    try {
      // Find the private folder using utility function
      const privateFolder = getFolderByType(folders as FolderNode[], 'private');
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
      setTimeout(() => {
        router.push(`/note/${pageId}`);
      }, 500);
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
      const isPage = folders.some(f => f.notes.some(p => p.id === id));

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
        // await updatePageName(id, tempName);
        await changeNoteTitle(id, tempName);
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
    // router.push(`/note/${noteId}`);
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

  const handleContextMenu = (e: React.MouseEvent, noteId: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      noteId: noteId
    });
  };

  const refreshData = () => {
    dispatch(loadSidebarData());
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
    refreshFavorites: () => {
      // This is now handled by the real-time listener
    },
  }));

  const shouldScroll = mainContentHeight + bottomSection1Height + bottomMenuHeight + 108 >= windowHeight;

  /*
   * LOADING STRATEGY:
   * 1. Initial auth loading - Shows SidebarSkeleton while checking authentication
   * 2. Unauthenticated state - Shows sign in prompt
   * 3. Initial data loading - Shows SidebarSkeleton while loading folders/data
   * 4. Granular loading - Individual components (FavoritesList, FolderTree) show their own skeletons
   */

  // Show skeleton while auth is loading
  if (isAuthLoading) {
    return <SidebarSkeleton />;
  }

  if (!auth.currentUser) {
    return (
      <aside className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2 bg-[color:var(--background)]">
        <div className="flex flex-col items-center justify-center h-32 text-gray-500 space-y-2">
          <span>Please sign in to view workspace</span>
          <button
            onClick={() => router.push('/signin')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Sign in
          </button>
        </div>
      </aside>
    );
  }

  // Show skeleton while loading initial data
  if (isLoading && folders.length === 0) {
    return <SidebarSkeleton />;
  }

  return (
    <>
      <aside className={`overflow-x-visible sticky top-0 w-60 h-screen shrink-0 border-r border-black/10 dark:border-white/10 p-2 ${blueBackground} flex flex-col`} id="sidebar">
        <TopSection
          showProfile={showProfile}
          setShowProfile={setShowProfile}
          addNewNoteHandler={addNewNoteHandler}
          isLoading={isLoading}
          setShowSearchModal={setShowSearchModal}
          setShowInbox={setShowInbox}
          unreadNotificationCount={unreadNotificationCount}
        />
        <MainContent
          isLoading={isLoading}
          favoriteNotes={favoriteNotes}
          isLoadingFavorites={isLoadingFavorites}
          folders={folders as FolderNode[]}
          editingId={editingId}
          tempName={tempName}
          hoveredFolderId={hoveredFolderId}
          onToggleFolder={handleToggleFolder}
          onDoubleClick={handleDoubleClick}
          onRename={handleRename}
          onSetTempName={setTempName}
          onSetHoveredFolderId={setHoveredFolderId}
          onContextMenu={handleContextMenu}
          isDefaultFolder={isDefaultFolder}
          selectedPageId={selectedPageId}
          onPageClick={handlePageClick}
          setShowTrashSidebar={setShowTrashSidebar}
          setShowSettings={setShowSettings}
          onHeightChange={setMainContentHeight}
          onBottomSection1HeightChange={setBottomSection1Height}
          shouldScroll={shouldScroll}
        />

        <BottomMenu
          setShowCalendarModal={setShowCalendarModal}
          setShowHelpContactMore={setShowHelpContactMore}
          setShowInviteMembers={setShowInviteMembers}
          setShowManageMembers={setShowManageMembers}
          onHeightChange={setBottomMenuHeight}
        />
      </aside>

      {/* Note Context Menu */}
      {contextMenu.visible && contextMenu.noteId && (
        <div
          className={`fixed z-40 note-context-menu top-[${contextMenu.y}px] left-[${contextMenu.x}px]`}
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
        trashFolder={folders.find(f => f.folderType === 'trash') as FolderNode}
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

      {/* More Options Sidebar */}
      {showMoreOptionsSidebarForFavorites && (
        <MoreOptionsSidebar
          selectedNoteId={showMoreOptionsSidebarForFavorites}
          folderName='Favorites'
          onClose={() => resetShowMoreOptionsSidebarForFavorites()}
          offsetY={offsetY}
        />
      )}

      {showMoreOptionsSidebarForFolderTree && (
        <MoreOptionsSidebar
          selectedNoteId={showMoreOptionsSidebarForFolderTree}
          folderName='Folder Tree'
          onClose={() => resetShowMoreOptionsSidebarForFolderTree()}
          offsetY={offsetY}
        />
      )}

      {/* Adda Sub Note Sidebar */}
      {showAddaSubNoteSidebarForFavorites && (
        <AddaSubNoteSidebar
          selectedNoteId={showAddaSubNoteSidebarForFavorites}
          onClose={() => resetShowAddaSubNoteSidebarForFavorites()}
          offsetY={offsetY}
        />
      )}

      {showAddaSubNoteSidebarForFolderTree && (
        <AddaSubNoteSidebar
          selectedNoteId={showAddaSubNoteSidebarForFolderTree}
          onClose={() => resetShowAddaSubNoteSidebarForFolderTree()}
          offsetY={offsetY}
        />
      )}
    </>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar; 