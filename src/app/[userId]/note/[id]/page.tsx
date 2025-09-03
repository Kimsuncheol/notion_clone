'use client';
import React, { useState, useEffect } from "react";
import MarkdownEditor from "@/components/markdown/MarkdownEditor"
import { EditModeProvider } from "@/contexts/EditModeContext";
import { useParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { fetchPublicNoteContent } from '@/services/firebase';
import { fetchNoteContent, increaseViewCount } from '@/services/markdown/firebase';
import { Skeleton } from '@mui/material';
import { useModalStore } from '@/store/modalStore';
import { Comment } from '@/types/comments';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AIChatSidebar from '@/components/AIChatSidebar';
import { createOrGetUser } from '@/services/firebase';
import Link from "next/link";
import { useIsPublicNoteStore } from "@/store/isPublicNoteStore";
import TrendingHeader from "@/components/trending/TrendingHeader";
import { useMarkdownEditorContentStore } from "@/store/markdownEditorContentStore";

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

  handleBlockCommentsChange: (comments: Record<string, Comment[]>) => void;
  templateId: string | null;
  templateTitle: string | null;
  showChatModal: boolean;
  setShowChatModal: (show: boolean) => void;
}

function PublicNoteViewer({
  selectedPageId,
  isPublic,

  handleBlockCommentsChange,
  templateId,
  templateTitle,
  showChatModal,
  setShowChatModal
}: PublicNoteViewerProps) {
  return (
    <EditModeProvider initialEditMode={false}>
      <div className="flex h-full text-sm sm:text-base text-[color:var(--foreground)] relative">
        <div className="w-[90%] mx-auto flex flex-col">
          <TrendingHeader />
          <MarkdownEditor
            key={selectedPageId}
            pageId={selectedPageId}

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
  selectedPageId: string;
  blockComments: Record<string, Comment[]>;
  getBlockTitle: (blockId: string) => string;
  isPublic: boolean;
  onTogglePublic: () => void;
  userRole: 'owner' | 'editor' | 'viewer' | null;

  handleBlockCommentsChange: (comments: Record<string, Comment[]>) => void;
  templateId: string | null;
  templateTitle: string | null;
  showChatModal: boolean;
  setShowChatModal: (show: boolean) => void;
}

function FullEditorInterface({
  selectedPageId,
  templateId,
  templateTitle,
  showChatModal,
  setShowChatModal,
}: FullEditorInterfaceProps) {
  const { viewMode, setViewMode } = useMarkdownEditorContentStore();
  // when unmounting, set the view mode to preview
  useEffect(() => {
    return () => {
      setViewMode('preview');
    };
  }, [setViewMode]);

  return (
    <EditModeProvider initialEditMode={true}>
      <div className={`flex ${viewMode === 'split' ? '' : ''} no-scrollbar text-sm sm:text-base text-[color:var(--foreground)] relative`}>
        <div className="w-full flex flex-col h-full overflow-hidden">
          <MarkdownEditor
            key={selectedPageId}
            pageId={selectedPageId}

            onBlockCommentsChange={() => { }}
            isPublic={false}
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
  console.log('noteId: ', id);
  const [selectedPageId] = useState<string>(id as string || '');
  const [blockComments, setBlockComments] = useState<Record<string, Comment[]>>({});
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    increaseViewCount(id as string || '');
    console.log('noteId: ', id);
  }, [id]);

  const auth = getAuth(firebaseApp);
  const { isPublic } = useIsPublicNoteStore();

  // Custom hooks
  const { isPublicNote, isCheckingAccess, isOwnNote, userRole } = useNoteAccess(id as string || '');
  useBeginnerLogic(isOwnNote, isPublicNote);


  const getBlockTitle = (blockId: string): string => {
    return `Block ${blockId.slice(0, 8)}...`;
  };

  const handleBlockCommentsChange = (newBlockComments: Record<string, Comment[]>) => {
    setBlockComments(newBlockComments);
  };


  // Early returns for different states
  if (!id) {
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
        onTogglePublic={() => { }}
        userRole={userRole}

        handleBlockCommentsChange={handleBlockCommentsChange}
        templateId={null}
        templateTitle={null}
        showChatModal={showChatModal}
        setShowChatModal={setShowChatModal}
      />
    );
  }

  return (
    <FullEditorInterface
      selectedPageId={selectedPageId}
      blockComments={blockComments}
      getBlockTitle={getBlockTitle}
      isPublic={isPublic}
      onTogglePublic={() => { }}
      userRole={userRole}
      handleSaveTitle={() => { }}
      handleBlockCommentsChange={handleBlockCommentsChange}
      templateId={null}
      templateTitle={null}
      showChatModal={showChatModal}
      setShowChatModal={setShowChatModal}
    />
  );
}