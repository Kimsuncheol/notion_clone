'use client';
import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { addNotePage, updatePageName, updateFolderName, updateNoteRecentlyOpen, subscribeToFavorites, FavoriteNote } from '@/services/firebase';
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

  // Effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load data from Redux/Firebase when user authenticates
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
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

  const addNewNoteHandler = async (mode: 'general' | 'markdown' = 'general') => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create notes');
      return;
    }

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

  const shouldScroll = mainContentHeight + bottomSection1Height + bottomMenuHeight + 40 >= windowHeight;

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
      <aside className={`sticky top-0 w-60 h-screen shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2 ${blueBackground} flex flex-col`} id="sidebar">
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
          setShowInviteMembers={setShowInviteMembers}
          setShowManageMembers={setShowManageMembers}
          onHeightChange={setMainContentHeight}
          onBottomSection1HeightChange={setBottomSection1Height}
          shouldScroll={shouldScroll}
        />

        <BottomMenu
          setShowCalendarModal={setShowCalendarModal}
          setShowHelpContactMore={setShowHelpContactMore}
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