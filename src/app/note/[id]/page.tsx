'use client';
import React, { useState, useRef, useEffect } from "react";
import Sidebar, { SidebarHandle } from "@/components/Sidebar";
import Header from "@/components/Header";
import MarkdownEditor from "@/components/MarkdownEditor";
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

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2">
        <div className="flex flex-col gap-2">
          <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
          <div className="ml-4 flex flex-col gap-1">
            <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full">
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

// Public note access message component
function PublicNoteAccessMessage() {
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

// AI Chat trigger button component
interface AIChatTriggerProps {
  showChatModal: boolean;
  onOpenChat: () => void;
}

function AIChatTrigger({ showChatModal, onOpenChat }: AIChatTriggerProps) {
  if (showChatModal) return null;

  return (
    <button
      onClick={onOpenChat}
      className="fixed bottom-4 right-4 p-2 w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg transition-colors duration-200 shadow-lg hover:shadow-xl flex items-center justify-center z-50"
      title="Open AI Chat"
    >
      <SmartToyIcon fontSize="inherit" />
    </button>
  );
}

// Enhanced AI Chat trigger for authenticated users
interface EnhancedAIChatTriggerProps {
  showChatModal: boolean;
  onOpenChat: () => void;
}

function EnhancedAIChatTrigger({ showChatModal, onOpenChat }: EnhancedAIChatTriggerProps) {
  if (showChatModal) return null;

  return (
    <button
      onClick={onOpenChat}
      className="fixed bottom-10 right-10 p-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg transition-colors duration-200 shadow-lg hover:shadow-xl z-50"
      title="Open AI Chat"
    >
      <SmartToyIcon style={{ fontSize: '1.5rem' }} />
    </button>
  );
}

// Public note viewer component
interface PublicNoteViewerProps {
  selectedPageId: string;
  blockComments: Record<string, Comment[]>;
  getBlockTitle: (blockId: string) => string;
  isPublic: boolean;
  onTogglePublic: () => void;
  userRole: 'owner' | 'editor' | 'viewer' | null;
  handleSaveTitle: (title: string) => void;
  handleBlockCommentsChange: (comments: Record<string, Comment[]>) => void;
  templateId: string | null;
  templateTitle: string | null;
  showChatModal: boolean;
  setShowChatModal: (show: boolean) => void;
}

function PublicNoteViewer({
  selectedPageId,
  blockComments,
  getBlockTitle,
  isPublic,
  onTogglePublic,
  userRole,
  handleSaveTitle,
  handleBlockCommentsChange,
  templateId,
  templateTitle,
  showChatModal,
  setShowChatModal
}: PublicNoteViewerProps) {
  return (
    <EditModeProvider initialEditMode={false}>
      <div className="flex h-full text-sm sm:text-base text-[color:var(--foreground)] relative">
        <div className="flex-1 flex flex-col">
          <Header
            blockComments={blockComments}
            getBlockTitle={getBlockTitle}
            isPublic={isPublic}
            onTogglePublic={onTogglePublic}
            userRole={userRole}
            onFavoriteToggle={() => {}}
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
        <AIChatSidebar
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
        <AIChatTrigger 
          showChatModal={showChatModal} 
          onOpenChat={() => setShowChatModal(true)} 
        />
      </div>
    </EditModeProvider>
  );
}

// Full editor interface component
interface FullEditorInterfaceProps {
  sidebarVisible: boolean;
  sidebarRef: React.RefObject<SidebarHandle>;
  selectedPageId: string;
  handleSelectPage: (pageId: string) => void;
  blockComments: Record<string, Comment[]>;
  getBlockTitle: (blockId: string) => string;
  isPublic: boolean;
  onTogglePublic: () => void;
  userRole: 'owner' | 'editor' | 'viewer' | null;
  handleSaveTitle: (title: string) => void;
  handleBlockCommentsChange: (comments: Record<string, Comment[]>) => void;
  templateId: string | null;
  templateTitle: string | null;
  showChatModal: boolean;
  setShowChatModal: (show: boolean) => void;
  showManual: boolean;
  setShowManual: (show: boolean) => void;
}

function FullEditorInterface({
  sidebarVisible,
  sidebarRef,
  selectedPageId,
  handleSelectPage,
  blockComments,
  getBlockTitle,
  isPublic,
  onTogglePublic,
  userRole,
  handleSaveTitle,
  handleBlockCommentsChange,
  templateId,
  templateTitle,
  showChatModal,
  setShowChatModal,
  showManual,
  setShowManual
}: FullEditorInterfaceProps) {
  return (
    <EditModeProvider initialEditMode={true}>
      <div className="flex h-full text-sm sm:text-base text-[color:var(--foreground)] relative">
        {sidebarVisible && (
          <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
        )}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header
            blockComments={blockComments}
            getBlockTitle={getBlockTitle}
            isPublic={isPublic}
            onTogglePublic={onTogglePublic}
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
        <AIChatSidebar
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
        />
        <EnhancedAIChatTrigger 
          showChatModal={showChatModal} 
          onOpenChat={() => setShowChatModal(true)} 
        />
        <ManualSidebar
          open={showManual}
          onClose={() => setShowManual(false)}
        />
      </div>
    </EditModeProvider>
  );
}

// Custom hooks for note page logic
function useNoteAccess(noteId: string) {
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isOwnNote, setIsOwnNote] = useState(false);
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
  
  const auth = getAuth(firebaseApp);
  const { setIsPublic } = useIsPublicNoteStore();

  useEffect(() => {
    if (!noteId) return;
    
    const checkNoteAccess = async () => {
      setIsCheckingAccess(true);

      try {
        if (auth.currentUser) {
          try {
            const noteContent = await fetchNoteContent(noteId);
            setIsPublicNote(false);
            setIsOwnNote(true);
            setIsPublic(noteContent?.isPublic || false);
            setNoteTitle(noteContent?.title || '');
            setUserRole('owner');
            setIsCheckingAccess(false);
            return;
          } catch {
            console.log('Private access failed, trying public access');
          }
        }

        try {
          await fetchPublicNoteContent(noteId);
          setIsPublicNote(true);
          setIsOwnNote(false);
          setIsPublic(true);
          setUserRole('viewer');
        } catch {
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

  return {
    isPublicNote,
    noteTitle,
    isCheckingAccess,
    isOwnNote,
    userRole,
    setNoteTitle
  };
}

function useSidebarLogic(isOwnNote: boolean, isPublicNote: boolean) {
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const auth = getAuth(firebaseApp);
  const dispatch = useAppDispatch();
  const { lastUpdated } = useAppSelector((state) => state.sidebar);

  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\' && e.shiftKey) {
        e.preventDefault();
        if (isOwnNote && !isPublicNote) {
          setSidebarVisible(prev => {
            const newVisible = !prev;
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

  // Load sidebar data when sidebar is visible
  useEffect(() => {
    if (sidebarVisible && auth.currentUser && isOwnNote && !isPublicNote && !lastUpdated) {
      dispatch(loadSidebarData());
    }
  }, [sidebarVisible, auth.currentUser, isOwnNote, isPublicNote, lastUpdated, dispatch]);

  return { sidebarVisible, setSidebarVisible };
}

function useBeginnerLogic(isOwnNote: boolean, isPublicNote: boolean) {
  const { showManual, setShowManual, setIsBeginner, manualDismissedForSession } = useModalStore();
  const auth = getAuth(firebaseApp);

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

  return { showManual, setShowManual };
}

// Main NotePage component
export default function NotePage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const noteId = Array.isArray(id) ? id[0] : id;
  const [selectedPageId, setSelectedPageId] = useState<string>(noteId || '');
  const [blockComments, setBlockComments] = useState<Record<string, Comment[]>>({});
  const [showChatModal, setShowChatModal] = useState(false);

  // Template initialization
  const templateId = searchParams.get('template');
  const templateTitle = searchParams.get('title');

  const sidebarRef = useRef<SidebarHandle>(null);
  const auth = getAuth(firebaseApp);
  const dispatch = useAppDispatch();
  const { isPublic, setIsPublic } = useIsPublicNoteStore();

  // Custom hooks
  const { isPublicNote, noteTitle, isCheckingAccess, isOwnNote, userRole } = useNoteAccess(noteId || '');
  const { sidebarVisible } = useSidebarLogic(isOwnNote, isPublicNote);
  const { showManual, setShowManual } = useBeginnerLogic(isOwnNote, isPublicNote);

  const handleSaveTitle = (title: string) => {
    sidebarRef.current?.renamePage(selectedPageId, title);
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
  };

  const getBlockTitle = (blockId: string): string => {
    return `Block ${blockId.slice(0, 8)}...`;
  };

  const handleBlockCommentsChange = (newBlockComments: Record<string, Comment[]>) => {
    setBlockComments(newBlockComments);
  };

  const handleTogglePublic = async () => {
    if (!noteId || !auth.currentUser || userRole !== 'owner') return;

    try {
      const newIsPublic = await toggleNotePublic(noteId);
      setIsPublic(newIsPublic);
      dispatch(moveNoteBetweenFolders({
        noteId: noteId,
        isPublic: newIsPublic,
        title: noteTitle || 'Note'
      }));
    } catch (error) {
      console.error('Error toggling note public status:', error);
    }
  };

  // Early returns for different states
  if (!noteId) {
    return <div>Invalid page ID</div>;
  }

  if (isCheckingAccess) {
    return <LoadingSkeleton />;
  }

  if ((isPublicNote && !isOwnNote) || !auth.currentUser) {
    return <PublicNoteAccessMessage />;
  }

  if (isPublicNote && auth.currentUser && !isOwnNote) {
    return (
      <PublicNoteViewer
        selectedPageId={selectedPageId}
        blockComments={blockComments}
        getBlockTitle={getBlockTitle}
        isPublic={isPublic}
        onTogglePublic={handleTogglePublic}
        userRole={userRole}
        handleSaveTitle={handleSaveTitle}
        handleBlockCommentsChange={handleBlockCommentsChange}
        templateId={templateId}
        templateTitle={templateTitle}
        showChatModal={showChatModal}
        setShowChatModal={setShowChatModal}
      />
    );
  }

  return (
    <FullEditorInterface
      sidebarVisible={sidebarVisible}
      sidebarRef={sidebarRef as React.RefObject<SidebarHandle>}
      selectedPageId={selectedPageId}
      handleSelectPage={handleSelectPage}
      blockComments={blockComments}
      getBlockTitle={getBlockTitle}
      isPublic={isPublic}
      onTogglePublic={handleTogglePublic}
      userRole={userRole}
      handleSaveTitle={handleSaveTitle}
      handleBlockCommentsChange={handleBlockCommentsChange}
      templateId={templateId}
      templateTitle={templateTitle}
      showChatModal={showChatModal}
      setShowChatModal={setShowChatModal}
      showManual={showManual}
      setShowManual={setShowManual}
    />
  );
}