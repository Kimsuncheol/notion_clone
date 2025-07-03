'use client';
import React, { useState, useRef, useEffect } from "react";
import Sidebar, { SidebarHandle } from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Header from "@/components/Header";
import MarkdownEditor from "@/components/MarkdownEditor";

import PublicNoteViewer from "@/components/PublicNoteViewer";
import Inbox from "@/components/Inbox";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { useParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { fetchNoteContent, fetchPublicNoteContent, toggleNotePublic } from '@/services/firebase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSidebarData, movePageBetweenFolders } from '@/store/slices/sidebarSlice';
import { Skeleton } from '@mui/material';
import { useModalStore } from '@/store/modalStore';
import { Comment } from '@/types/comments';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AIChatSidebar from '@/components/AIChatSidebar';

export default function NotePage() {
  const { id } = useParams();
  const pageId = Array.isArray(id) ? id[0] : id;
  const [selectedPageId, setSelectedPageId] = useState<string>(pageId || '');
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isOwnNote, setIsOwnNote] = useState(false);
  const [noteType, setNoteType] = useState<'general' | 'markdown'>('general');
  const { showInbox, setShowInbox, setUnreadNotificationCount } = useModalStore();
  const sidebarRef = useRef<SidebarHandle>(null);
  const auth = getAuth(firebaseApp);
  const dispatch = useAppDispatch();
  const { lastUpdated } = useAppSelector((state) => state.sidebar);
  const [blockComments, setBlockComments] = useState<Record<string, Comment[]>>({});
  const [noteIsPublic, setNoteIsPublic] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  // Check if this is a public note or private note
  useEffect(() => {
    if (!pageId) return;
    const checkNoteAccess = async () => {
      setIsCheckingAccess(true);
      
      try {
        // First, try to fetch as a private note if user is authenticated
        if (auth.currentUser) {
          try {
            const noteContent = await fetchNoteContent(pageId);
            setIsPublicNote(false);
            setIsOwnNote(true); // User can access their own note
            setNoteIsPublic(noteContent?.isPublic || false);
            setNoteType(noteContent?.noteType || 'general'); // Set note type
            
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
          const publicNote = await fetchPublicNoteContent(pageId);
          setIsPublicNote(true);
          setIsOwnNote(false); // This is someone else's public note
          setNoteIsPublic(true); // Public notes are by definition public
          setNoteType(publicNote?.noteType || 'general'); // Set note type for public notes
          setUserRole('viewer'); // Viewing someone else's public note
        } catch {
          // If both fail, it's likely a private note that requires authentication
          setIsPublicNote(false);
          setIsOwnNote(false);
          setNoteIsPublic(false);
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
  }, [pageId, auth.currentUser]);

  // Keyboard shortcut for toggling sidebar (Cmd+\ or Ctrl+\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
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
    if (!pageId || !auth.currentUser) return;
    
    // Only owners can change public/private status
    if (userRole !== 'owner') {
      return;
    }

    try {
      const newIsPublic = await toggleNotePublic(pageId);
      setNoteIsPublic(newIsPublic);
      
      // Update the sidebar to move the note to the appropriate folder
      dispatch(movePageBetweenFolders({ 
        pageId, 
        isPublic: newIsPublic, 
        title: 'Note' // Title will be updated by the Editor component
      }));
    } catch (error) {
      console.error('Error toggling note public status:', error);
    }
  };

  // Early return if pageId is undefined
  if (!pageId) {
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

  // If it's a public note (someone else's) or user is not authenticated, show public viewer
  if ((isPublicNote && !isOwnNote) || !auth.currentUser) {
    return <PublicNoteViewer pageId={pageId} />;
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
              isPublic={noteIsPublic}
              onTogglePublic={handleTogglePublic}
              userRole={userRole}
              onFavoriteToggle={() => {}} // No sidebar in public view mode
            />
            {noteType === 'general' ? (
              <Editor 
                key={selectedPageId} 
                pageId={selectedPageId} 
                onSaveTitle={handleSaveTitle}
                onBlockCommentsChange={handleBlockCommentsChange}
                isPublic={noteIsPublic}
              />
            ) : (
              <MarkdownEditor 
                key={selectedPageId} 
                pageId={selectedPageId} 
                onSaveTitle={handleSaveTitle}
                onBlockCommentsChange={handleBlockCommentsChange}
                isPublic={noteIsPublic}
              />
            )}
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
            isPublic={noteIsPublic}
            onTogglePublic={handleTogglePublic}
            userRole={userRole}
            onFavoriteToggle={() => sidebarRef.current?.refreshFavorites()}
          />
          {noteType === 'general' ? (
            <Editor 
              key={selectedPageId} 
              pageId={selectedPageId} 
              onSaveTitle={handleSaveTitle}
              onBlockCommentsChange={handleBlockCommentsChange}
              isPublic={noteIsPublic}
            />
          ) : (
            <MarkdownEditor 
              key={selectedPageId} 
              pageId={selectedPageId} 
              onSaveTitle={handleSaveTitle}
              onBlockCommentsChange={handleBlockCommentsChange}
              isPublic={noteIsPublic}
            />
          )}
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
            className="fixed bottom-4 right-4 p-2 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg transition-colors duration-200 shadow-lg hover:shadow-xl z-50"
            title="Open AI Chat"
          >
            <SmartToyIcon fontSize="small" />
          </button>
        )}

      </div>
    </EditModeProvider>
  );
}
