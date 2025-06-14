'use client';
import React, { useState, useRef, use as usePromise, useEffect } from "react";
import Sidebar, { SidebarHandle } from "@/components/Sidebar";
import Editor from "@/components/Editor";
import Header from "@/components/Header";
import ManualModal from "@/components/ManualModal";
import PublicNoteViewer from "@/components/PublicNoteViewer";
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { fetchNoteContent, fetchPublicNoteContent } from '@/services/firebase';

interface Props {
  params: Promise<{ id: string }>;
}

export default function NotePage({ params }: Props) {
  // `params` is a promise in the latest Next.js canary; unwrap it for future-proofing.
  const { id } = usePromise(params);
  const [selectedPageId, setSelectedPageId] = useState<string>(id);
  const [showManual, setShowManual] = useState(false);
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const sidebarRef = useRef<SidebarHandle>(null);
  const router = useRouter();
  const auth = getAuth(firebaseApp);

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
        } catch {
          // If both fail, it's likely a private note that requires authentication
          setIsPublicNote(false);
        }
      } catch (error) {
        console.error('Error checking note access:', error);
        setIsPublicNote(false);
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkNoteAccess();
  }, [id, auth.currentUser]);

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
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full mx-auto mb-4"></div>
          <div className="text-gray-500">Loading note...</div>
        </div>
      </div>
    );
  }

  // If it's a public note or user is not authenticated, show public viewer
  if (isPublicNote || !auth.currentUser) {
    return <PublicNoteViewer pageId={id} />;
  }

  // Otherwise, show the full editor interface for authenticated users
  return (
    <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
      <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
      <div className="flex-1 flex flex-col">
        <Header onOpenManual={() => setShowManual(true)} />
        <Editor key={selectedPageId} pageId={selectedPageId} onSaveTitle={handleSaveTitle} />
      </div>
      <ManualModal open={showManual} onClose={() => setShowManual(false)} />
    </div>
  );
}
