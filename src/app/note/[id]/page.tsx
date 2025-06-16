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
import { Skeleton } from '@mui/material';
import { useModalStore } from '@/store/modalStore';

interface Props {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: Props) {
  // `params` is a promise in the latest Next.js canary; unwrap it for future-proofing.
  const { id } = usePromise(params);
  const [selectedPageId, setSelectedPageId] = useState<string>(id);
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isOwnNote, setIsOwnNote] = useState(false);
  const { showManual, setShowManual } = useModalStore();
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
