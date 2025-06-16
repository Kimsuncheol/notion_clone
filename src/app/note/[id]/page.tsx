'use client';
import React, { useState, useRef, use as usePromise, useEffect } from "react";
import Sidebar, { SidebarHandle } from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Header from "@/components/Header";
import ManualModal from "@/components/ManualModal";
import PublicNoteViewer from "@/components/PublicNoteViewer";
import { EditModeProvider } from "@/contexts/EditModeContext";
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { fetchNoteContent, fetchPublicNoteContent } from '@/services/firebase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';
import { Skeleton, Box } from '@mui/material';

interface Props {
  params: Promise<{ id: string }>;
}

// Skeleton component for loading note page
const NoteLoadingSkeleton = () => (
  <div className="flex min-h-screen bg-[color:var(--background)]">
    {/* Sidebar Skeleton */}
    <aside className="hidden sm:block w-60 shrink-0 border-r border-black/10 dark:border-white/10 py-4 px-2">
      <div className="mb-3 px-2">
        <Skeleton variant="text" width="60%" height={20} />
      </div>
      <div className="mb-4 px-2">
        <Skeleton variant="rectangular" height={36} />
      </div>
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, folderIndex) => (
          <div key={folderIndex}>
            <div className="px-2 py-1">
              <Skeleton variant="text" width="70%" height={20} />
            </div>
            <div className="ml-4 flex flex-col gap-1">
              {[...Array(2)].map((_, pageIndex) => (
                <div key={pageIndex} className="px-2 py-1">
                  <Skeleton variant="text" width="60%" height={16} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>

    {/* Main Content Skeleton */}
    <div className="flex-1 flex flex-col">
      {/* Header Skeleton */}
      <header className="w-full flex items-center justify-end px-6 py-2 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      </header>

      {/* Editor Skeleton */}
      <main className="flex-1 flex flex-col items-center overflow-y-auto py-10">
        <div className="w-full max-w-3xl px-6">
          {/* Title Skeleton */}
          <div className="mb-8">
            <Skeleton variant="text" width="60%" height={48} sx={{ mb: 2 }} />
          </div>

          {/* Content Blocks Skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Box key={index} sx={{ mb: 3 }}>
                <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="85%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="70%" height={24} />
              </Box>
            ))}
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default function NotePage({ params }: Props) {
  // `params` is a promise in the latest Next.js canary; unwrap it for future-proofing.
  const { id } = usePromise(params);
  const [selectedPageId, setSelectedPageId] = useState<string>(id);
  const [showManual, setShowManual] = useState(false);
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isOwnNote, setIsOwnNote] = useState(false);
  const sidebarRef = useRef<SidebarHandle>(null);
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const dispatch = useAppDispatch();
  const { lastUpdated } = useAppSelector((state) => state.sidebar);

  // Check if this is a public note or private note
  useEffect(() => {
    const checkNoteAccess = async () => {
      setIsCheckingAccess(true);
      
      try {
        // First, try to fetch as a private note if user is authenticated
        if (auth.currentUser) {
          try {
            await fetchNoteContent(id);
            setIsPublicNote(false);
            setIsOwnNote(true); // User can access their own note
            setIsCheckingAccess(false);
            return;
          } catch {
            // If private access fails, try public access
            console.log('Private access failed, trying public access');
          }
        }
        
        // Try to fetch as a public note
        try {
          await fetchPublicNoteContent(id);
          setIsPublicNote(true);
          setIsOwnNote(false); // This is someone else's public note
        } catch {
          // If both fail, it's likely a private note that requires authentication
          setIsPublicNote(false);
          setIsOwnNote(false);
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
  }, [id, auth.currentUser]);

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
    router.push(`/note/${pageId}`);
  };

  if (isCheckingAccess) {
    return <NoteLoadingSkeleton />;
  }

  // If it's a public note (someone else's) or user is not authenticated, show public viewer
  if ((isPublicNote && !isOwnNote) || !auth.currentUser) {
    return <PublicNoteViewer pageId={id} />;
  }

  // If it's someone else's note that we can access (public note viewed by authenticated user)
  if (isPublicNote && auth.currentUser && !isOwnNote) {
    return (
      <EditModeProvider initialEditMode={false}>
        <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
          <div className="flex-1 flex flex-col">
            <Header onOpenManual={() => setShowManual(true)} />
            <Editor key={selectedPageId} pageId={selectedPageId} onSaveTitle={handleSaveTitle} />
          </div>
          <ManualModal open={showManual} onClose={() => setShowManual(false)} />
        </div>
      </EditModeProvider>
    );
  }

  // Otherwise, show the full editor interface for authenticated users accessing their own notes
  return (
    <EditModeProvider initialEditMode={true}>
      <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
        {sidebarVisible && (
          <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
        )}
        <div className="flex-1 flex flex-col">
          <Header onOpenManual={() => setShowManual(true)} />
          <Editor key={selectedPageId} pageId={selectedPageId} onSaveTitle={handleSaveTitle} />
        </div>
        <ManualModal open={showManual} onClose={() => setShowManual(false)} />
      </div>
    </EditModeProvider>
  );
}
