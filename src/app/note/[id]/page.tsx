'use client';
import React, { useState, useRef, useEffect } from "react";
import Sidebar, { SidebarHandle } from "@/components/Sidebar";
import Header from "@/components/Header";
import MarkdownEditor from "@/components/MarkdownEditor";

import Inbox from "@/components/Inbox";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { useParams, useSearchParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { fetchNoteContent, fetchPublicNoteContent, toggleNotePublic } from '@/services/firebase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSidebarData, moveNoteBetweenFolders } from '@/store/slices/sidebarSlice';
import { Skeleton } from '@mui/material';
import { useModalStore } from '@/store/modalStore';
import { Comment } from '@/types/comments';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AIChatSidebar from '@/components/AIChatSidebar';
import { createOrGetUser } from '@/services/firebase';
import ManualSidebar from '@/components/ManualSidebar';
import Link from "next/link";
import { useIsPublicNoteStore } from "@/store/isPublicNoteStore";

export default function NotePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const noteId = Array.isArray(id) ? id[0] : id;
  const [selectedPageId, setSelectedPageId] = useState<string>(noteId || '');
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isOwnNote, setIsOwnNote] = useState(false);

  // Template initialization
  const templateId = searchParams.get('template');
  const templateTitle = searchParams.get('title');

  const { showInbox, setShowInbox, setUnreadNotificationCount, showManual, setShowManual, setIsBeginner, manualDismissedForSession } = useModalStore();
  const sidebarRef = useRef<SidebarHandle>(null);
  const auth = getAuth(firebaseApp);
  const dispatch = useAppDispatch();
  const { lastUpdated } = useAppSelector((state) => state.sidebar);
  const [blockComments, setBlockComments] = useState<Record<string, Comment[]>>({});
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const { isPublic, setIsPublic } = useIsPublicNoteStore();
  
  // Check if this is a public note or private note
  useEffect(() => {
    if (!noteId) return;
    const checkNoteAccess = async () => {
      setIsCheckingAccess(true);

      try {
        // First, try to fetch as a private note if user is authenticated
        if (auth.currentUser) {
          try {
            const noteContent = await fetchNoteContent(noteId);
            setIsPublicNote(false);
            setIsOwnNote(true); // User can access their own note
            setIsPublic(noteContent?.isPublic || false);
            setNoteTitle(noteContent?.title || '');
            // Get user role (you'll need to implement this based on your workspace system)
            // For now, assuming users are owners of their own notes
            setUserRole('owner');

            setIsCheckingAccess(false);
            return;
          } catch {
            // If private access fails, try public access
            console.log('Private access failed, trying public access');
          }
        }

        // Try to fetch as a public note
        try {
          await fetchPublicNoteContent(noteId);
          setIsPublicNote(true);
          setIsOwnNote(false); // This is someone else's public note
          setIsPublic(true); // Public notes are by definition public

          setUserRole('viewer'); // Viewing someone else's public note
        } catch {
          // If both fail, it's likely a private note that requires authentication
          setIsPublicNote(false);
          setIsOwnNote(false);
          setIsPublic(false);
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error checking note access:', error);
        setIsPublicNote(false);
        setIsOwnNote(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkNoteAccess();
  }, [noteId, auth.currentUser, setIsPublic]);

  // Keyboard shortcut for toggling sidebar (Cmd+\ or Ctrl+\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\' && e.shiftKey) {
        e.preventDefault();
        // Only allow sidebar toggle for own notes
        if (isOwnNote && !isPublicNote) {
          setSidebarVisible(prev => {
            const newVisible = !prev;
            // If sidebar is becoming visible and we haven't loaded data yet, load it
            if (newVisible && auth.currentUser && !lastUpdated) {
              dispatch(loadSidebarData());
            }
            return newVisible;
          });
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOwnNote, isPublicNote, auth.currentUser, lastUpdated, dispatch]);

  // Load sidebar data when sidebar is visible and user is authenticated
  useEffect(() => {
    if (sidebarVisible && auth.currentUser && isOwnNote && !isPublicNote && !lastUpdated) {
      dispatch(loadSidebarData());
    }
  }, [sidebarVisible, auth.currentUser, isOwnNote, isPublicNote, lastUpdated, dispatch]);

  // Check if user is a beginner and show manual automatically
  useEffect(() => {
    const checkBeginnerStatus = async () => {
      if (auth.currentUser && isOwnNote && !isPublicNote) {
        try {
          const userData = await createOrGetUser();
          if (userData) {
            setIsBeginner(userData.isBeginner);
            if (userData.isBeginner && !showManual && !manualDismissedForSession) {
              setShowManual(true);
            }
          }
        } catch (error) {
          console.error('Error checking beginner status:', error);
        }
      }
    };

    checkBeginnerStatus();
  }, [auth.currentUser, isOwnNote, isPublicNote, setIsBeginner, setShowManual, showManual, manualDismissedForSession]);

  const handleSaveTitle = (title: string) => {
    // Update the page name in the sidebar
    sidebarRef.current?.renamePage(selectedPageId, title);
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    // router.push(`/note/${pageId}`);
  };

  // Function to get block title - could be enhanced to get actual block content
  const getBlockTitle = (blockId: string): string => {
    return `Block ${blockId.slice(0, 8)}...`;
  };

  // Handler for updating block comments (to be passed to Editor)
  const handleBlockCommentsChange = (newBlockComments: Record<string, Comment[]>) => {
    setBlockComments(newBlockComments);
  };

  // Handler for toggling public/private status
  const handleTogglePublic = async () => {
    if (!noteId || !auth.currentUser) return;

    // Only owners can change public/private status
    if (userRole !== 'owner') {
      return;
    }

    try {
      const newIsPublic = await toggleNotePublic(noteId);
      setIsPublic(newIsPublic);

      // Update the sidebar to move the note to the appropriate folder
      dispatch(moveNoteBetweenFolders({
        noteId: noteId,
        isPublic: newIsPublic,
        title: noteTitle || 'Note' // Title will be updated by the Editor component
      }));
    } catch (error) {
      console.error('Error toggling note public status:', error);
    }
  };

  // Early return if pageId is undefined
  if (!noteId) {
    return <div>Invalid page ID</div>;
  }

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-screen bg-[color:var(--background)]">
        <div className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2">
          <div className="flex flex-col gap-2">
            <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
            <div className="ml-4 flex flex-col gap-1">
              <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="w-full flex items-center justify-end px-6 py-2 border-b border-black/10 dark:border-white/10">
            <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
          </div>
          <div className="flex-1 p-6">
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 3 }} />
            <div className="flex flex-col gap-3">
              <Skeleton variant="rectangular" width="100%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width="95%" height={24} sx={{ borderRadius: 1 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If it's a public note (someone else's) or user is not authenticated, redirect to main page
  if ((isPublicNote && !isOwnNote) || !auth.currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Public Note Access</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This is a public note. Please sign in to view it in the markdown editor.
          </p>
          <Link href="/signin" className="text-blue-600 hover:text-blue-800 underline">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // If it's someone else's note that we can access (public note viewed by authenticated user)
  if (isPublicNote && auth.currentUser && !isOwnNote) {
    return (
      <EditModeProvider initialEditMode={false}>
        <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)] relative">
          <div className="flex-1 flex flex-col">
            <Header
              blockComments={blockComments}
              getBlockTitle={getBlockTitle}
              isPublic={isPublic}
              onTogglePublic={handleTogglePublic}
              userRole={userRole}
              onFavoriteToggle={() => { }} // No sidebar in public view mode
            />
            <MarkdownEditor
              key={selectedPageId}
              pageId={selectedPageId}
              onSaveTitle={handleSaveTitle}
              onBlockCommentsChange={handleBlockCommentsChange}
              isPublic={isPublic}
              templateId={templateId}
              templateTitle={templateTitle}
            />
          </div>
          {/* AI Chat Sidebar */}
          <AIChatSidebar
            isOpen={showChatModal}
            onClose={() => setShowChatModal(false)}
          />

          {/* Floating AI Chat Trigger - only show when chat is closed */}
          {!showChatModal && (
            <button
              onClick={() => setShowChatModal(true)}
              className="fixed bottom-4 right-4 p-2 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center z-50"
              title="Open AI Chat"
            >
              <SmartToyIcon fontSize="inherit" />
            </button>
          )}

        </div>
      </EditModeProvider>
    );
  }

  // Otherwise, show the full editor interface for authenticated users accessing their own notes
  return (
    <EditModeProvider initialEditMode={true}>
      <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)] relative">
        {sidebarVisible && (
          <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
        )}
        {showInbox && (
          <Inbox
            open={showInbox}
            onClose={() => setShowInbox(false)}
            onNotificationCountChange={setUnreadNotificationCount}
          />
        )}
        <div className="flex-1 flex flex-col">
          <Header
            blockComments={blockComments}
            getBlockTitle={getBlockTitle}
            isPublic={isPublic}
            onTogglePublic={handleTogglePublic}
            userRole={userRole}
            onFavoriteToggle={() => sidebarRef.current?.refreshFavorites()}
          />
          <MarkdownEditor
            key={selectedPageId}
            pageId={selectedPageId}
            onSaveTitle={handleSaveTitle}
            onBlockCommentsChange={handleBlockCommentsChange}
            isPublic={isPublic}
            templateId={templateId}
            templateTitle={templateTitle}
          />
        </div>
        {/* AI Chat Sidebar */}
        <AIChatSidebar
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />

        {/* Floating AI Chat Trigger - only show when chat is closed */}
        {!showChatModal && (
          <button
            onClick={() => setShowChatModal(true)}
            className="fixed bottom-10 right-10 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg transition-colors duration-200 shadow-lg hover:shadow-xl z-50"
            title="Open AI Chat"
          >
            <SmartToyIcon style={{ fontSize: '1.5rem' }} />
          </button>
        )}

        {/* Manual Sidebar for beginners */}
        <ManualSidebar
          open={showManual}
          onClose={() => setShowManual(false)}
        />

      </div>
    </EditModeProvider>
  );
}
