'use client';
import React, { useState, useEffect, Suspense, useMemo, useRef } from "react";
import MarkdownEditor from "@/components/markdown/MarkdownEditor";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { useParams, usePathname, useRouter } from 'next/navigation';
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
// import AIChatRoomModal from "@/components/ai/AIChatRoomModal";
import MarkdownPreviewPane from "@/components/markdown/MarkdownPreviewPane";
import StickySocialSidebar from "@/components/note/StickySocialSidebar";
import TableOfContents from "@/components/markdown/TableOfContents";
import { FirebaseNoteContent } from "@/types/firebase";
import ScreenCaptureTool from "@/components/note/ScreenCaptureTool";
import toast from "react-hot-toast";
import { NOTE_NAVIGATION_BLOCK_MESSAGE, shouldBlockNoteNavigation } from "@/utils/noteNavigation";

// Public note access message component
function PublicNoteAccessMessage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Note Access Restricted</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This note is private or you do not have permission to view it.
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
}

function PublicNoteViewer({ selectedPageId }: PublicNoteViewerProps) {
  const [noteData, setNoteData] = useState<FirebaseNoteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isInLikeUsers, setIsInLikeUsers] = useState(false);

  const setThumbnailUrl = useMarkdownStore((state) => state.setThumbnailUrl);
  const setViewMode = useMarkdownStore((state) => state.setViewMode);
  const viewMode = useMarkdownStore((state) => state.viewMode);

  useEffect(() => {
    setViewMode('preview');
  }, [setViewMode]);

  useEffect(() => {
    let isMounted = true;

    const loadNote = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const note = await fetchPublicNoteContent(selectedPageId);

        if (!isMounted) return;

        if (!note) {
          setHasError(true);
          setNoteData(null);
          return;
        }

        const currentUser = getAuth(firebaseApp).currentUser;
        const userId = currentUser?.uid;

        setNoteData(note);
        setThumbnailUrl(note.thumbnailUrl || null);
        setLikeCount(note.likeCount || 0);
        setIsInLikeUsers(userId ? Boolean(note.likeUsers?.some((likedUser) => likedUser.uid === userId)) : false);
      } catch (error) {
        console.error('Error loading public note:', error);
        if (!isMounted) return;
        setHasError(true);
        setNoteData(null);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNote();

    return () => {
      isMounted = false;
    };
  }, [selectedPageId, setThumbnailUrl]);

  const formattedDate = noteData?.updatedAt instanceof Date
    ? noteData.updatedAt.toLocaleDateString()
    : noteData?.createdAt instanceof Date
      ? noteData.createdAt.toLocaleDateString()
      : '';

  return (
    <EditModeProvider initialEditMode={false}>
      { viewMode === 'preview' && <ScreenCaptureTool noteId={selectedPageId} />}
      <div className="flex h-full text-sm sm:text-base text-[color:var(--foreground)] relative">
        <div className="w-[90%] mx-auto flex flex-col">
          <div className="flex h-full justify-center">
            <StickySocialSidebar
              pageId={selectedPageId}
              authorId={noteData?.authorId || ''}
              likeCount={likeCount}
              setLikeCount={setLikeCount}
              isInLikeUsers={isInLikeUsers}
              canInteract={Boolean(getAuth(firebaseApp).currentUser)}
            />

            <div className="flex h-full flex-col gap-4 w-2/3 max-w-4xl">
              <div className="flex-1 min-w-0" id="" >
                {noteData && (
                  <MarkdownPreviewPane
                    content={noteData.content || ''}
                    viewMode={'preview'}
                    pageId={selectedPageId}
                    authorName={noteData.authorName || ''}
                    authorEmail={noteData.authorEmail || ''}
                    authorId={noteData.authorId || ''}
                    date={formattedDate}
                    viewCount={noteData.viewCount || 0}
                    tags={noteData.tags || []}
                    title={noteData.title || ''}
                  />
                )}
                {!noteData && isLoading && (
                  <LoadingNote />
                )}
                {!noteData && !isLoading && hasError && (
                  <PublicNoteAccessMessage />
                )}
              </div>
            </div>

            <TableOfContents
              content={noteData?.content || ''}
              className="h-full"
            />
          </div>
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
}

function FullEditorInterface({
  selectedPageId,
  templateId,
  templateTitle,
}: FullEditorInterfaceProps) {
  const viewMode = useMarkdownStore((state) => state.viewMode);
  const setViewMode = useMarkdownStore((state) => state.setViewMode);
  // when unmounting, set the view mode to preview
  useEffect(() => {
    return () => {
      setViewMode('preview');
    };
  }, [setViewMode]);

  return (
    <EditModeProvider initialEditMode={true}>
      { viewMode === 'preview' && <ScreenCaptureTool noteId={selectedPageId} />}
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
<<<<<<< HEAD

        try {
          await fetchPublicNoteContent(noteId);
          setIsPublicNote(true);
=======
        try {
          await fetchPublicNoteContent(noteId);
          setIsPublicNote(true);

>>>>>>> b3c4f7f (.)
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
  const title = useMarkdownStore((state) => state.title);
  const content = useMarkdownStore((state) => state.content);
<<<<<<< HEAD
=======
  const viewMode = useMarkdownStore((state) => state.viewMode);
>>>>>>> b3c4f7f (.)
  const pathname = usePathname();
  const router = useRouter();
  const pathnameRef = useRef<string | null>(null);
  const shouldBlockNavigation = useMemo(
<<<<<<< HEAD
    () => shouldBlockNoteNavigation(pathname, title, content),
    [pathname, title, content]
=======
    () => shouldBlockNoteNavigation(viewMode, pathname, title, content),
    [pathname, title, content, viewMode]
>>>>>>> b3c4f7f (.)
  );
  const shouldBlockNavigationRef = useRef(shouldBlockNavigation);

  useEffect(() => {
    increaseViewCount(id as string || '');
    console.log('noteId: ', id);
  }, [id]);

  const { isPublic } = useIsPublicNoteStore();

  // Custom hooks
  const { isPublicNote, isCheckingAccess, isOwnNote, userRole } = useNoteAccess(id as string || '');
  useBeginnerLogic(isOwnNote, isPublicNote);

  useEffect(() => {
    shouldBlockNavigationRef.current = shouldBlockNavigation;
  }, [shouldBlockNavigation]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!isOwnNote) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldBlockNavigationRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isOwnNote]);

  useEffect(() => {
    if (!isOwnNote) return;

    const handlePopState = () => {
      if (!shouldBlockNavigationRef.current) return;
      toast.error(NOTE_NAVIGATION_BLOCK_MESSAGE);
      if (pathnameRef.current) {
        router.push(pathnameRef.current);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOwnNote, router]);


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

  if (isPublicNote && !isOwnNote) {
    return (
      <Suspense fallback={<LoadingNote />}>
        <PublicNoteViewer
          selectedPageId={selectedPageId}
        />
      </Suspense>
    );
  }

  if (!isOwnNote && !isPublicNote) {
    return <PublicNoteAccessMessage />;
  }

  return (
    <Suspense fallback={<LoadingNote />}>
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
      />
    </Suspense>
  );
}
