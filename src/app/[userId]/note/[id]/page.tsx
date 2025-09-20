'use client';
import React, { useState, useEffect } from "react";
import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { useParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { fetchPublicNoteContent } from '@/services/markdown/firebase';
import { fetchNoteContent, increaseViewCount } from '@/services/markdown/firebase';
import { useModalStore } from '@/store/modalStore';
import { Comment } from '@/types/comments';
import { createOrGetUser } from '@/services/sign-up/firebase';
import Link from "next/link";
import { useIsPublicNoteStore } from "@/store/isPublicNoteStore";
import { useMarkdownStore } from "@/store/markdownEditorContentStore";
import LoadingNote from "./loading";
import AIChatRoomModal from "@/components/ai/AIChatRoomModal";

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
}

function PublicNoteViewer({
  selectedPageId,
  isPublic,
  handleBlockCommentsChange,
  templateId,
  templateTitle,
}: PublicNoteViewerProps) {
  return (
    <EditModeProvider initialEditMode={false}>
      <div className="flex h-full text-sm sm:text-base text-[color:var(--foreground)] relative">
        <div className="w-[90%] mx-auto flex flex-col">
          <MarkdownEditor
            key={selectedPageId}
            pageId={selectedPageId}
            onBlockCommentsChange={handleBlockCommentsChange}
            isPublic={isPublic}
            templateId={templateId}
            templateTitle={templateTitle}
          />
        </div>
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
  onCloseChat: () => void;
}

function FullEditorInterface({
  selectedPageId,
  templateId,
  templateTitle,
  showChatModal,
  onCloseChat,
}: FullEditorInterfaceProps) {
  const { viewMode, setViewMode } = useMarkdownStore();
  // when unmounting, set the view mode to preview
  useEffect(() => {
    return () => {
      setViewMode('preview');
    };
  }, [setViewMode]);

  return (
    <EditModeProvider initialEditMode={true}>
      <div className={`flex no-scrollbar text-sm sm:text-base text-[color:var(--foreground)] relative`}>
        <div className={`w-full flex flex-col h-full ${viewMode === 'split' ? 'overflow-hidden' : ''}`}>
          <MarkdownEditor
            key={selectedPageId}
            pageId={selectedPageId}
            onBlockCommentsChange={() => { }}
            isPublic={false}
            templateId={templateId}
            templateTitle={templateTitle}
          />
        </div>
        {showChatModal && (
          <AIChatRoomModal
            open={showChatModal}
            onClose={onCloseChat}
          />
        )}
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
            setIsBeginner(userData.isBeginner as boolean);
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
  const showChatModal = useMarkdownStore((state) => state.showChatModal);
  const setShowChatModal = useMarkdownStore((state) => state.setShowChatModal);

  useEffect(() => {
    increaseViewCount(id as string || '');
    console.log('noteId: ', id);
  }, [id]);

  useEffect(() => {
    setShowChatModal(false);
    return () => setShowChatModal(false);
  }, [setShowChatModal]);

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
    return <LoadingNote />;
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
      handleBlockCommentsChange={handleBlockCommentsChange}
      templateId={null}
      templateTitle={null}
      showChatModal={showChatModal}
      onCloseChat={() => setShowChatModal(false)}
    />
  );
}
