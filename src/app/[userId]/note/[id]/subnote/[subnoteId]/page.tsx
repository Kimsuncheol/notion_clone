"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { EditModeProvider } from '@/contexts/EditModeContext';
import Header from '@/components/Header';
import Sidebar, { SidebarHandle } from '@/components/Sidebar';
import MarkdownEditor from '@/components/MarkdownEditor';
import Link from 'next/link';
import { fetchNoteContent } from '@/services/markdown/firebase';
import { fetchPublicNoteContent, toggleNotePublic } from '@/services/firebase';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { moveNoteBetweenFolders } from '@/store/slices/sidebarSlice';
import { useIsPublicNoteStore } from '@/store/isPublicNoteStore';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';

export default function SubNotePage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = getAuth(firebaseApp);
  const dispatch = useAppDispatch();
  const { lastUpdated } = useAppSelector((state) => state.sidebar);
  const { isPublic, setIsPublic } = useIsPublicNoteStore();
  const { setSelectedParentSubNoteId } = useAddaSubNoteSidebarStore();
  const sidebarRef = useRef<SidebarHandle>(null);

  const [noteId, subNoteId] = useMemo(() => {
    const parts = pathname.split('/').filter(Boolean);
    // expect ['note', noteId, 'subnote', subId]
    const noteIdx = parts.indexOf('note');
    const subIdx = parts.indexOf('subnote');
    const nId = noteIdx >= 0 ? parts[noteIdx + 1] : '';
    const sId = subIdx >= 0 ? parts[subIdx + 1] : '';
    return [nId || '', sId || ''] as const;
  }, [pathname]);

  const [selectedPageId, setSelectedPageId] = useState<string>('');
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isOwnNote, setIsOwnNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [userRole, setUserRole] = useState<'owner' | 'editor' | 'viewer' | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Initialize selection for sub-note
  useEffect(() => {
    if (noteId && subNoteId) {
      setSelectedParentSubNoteId(noteId, subNoteId);
      setSelectedPageId(noteId);
    }
  }, [noteId, subNoteId, setSelectedParentSubNoteId]);

  // Access check mirrors /note/[id]
  useEffect(() => {
    if (!noteId) return;
    const check = async () => {
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
            // fallthrough to public
          }
        }
        // public access
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
      } finally {
        setIsCheckingAccess(false);
      }
    };
    check();
  }, [noteId, auth.currentUser, setIsPublic]);

  // Toggle public/private for owners
  const handleTogglePublic = async () => {
    if (!noteId || !auth.currentUser) return;
    if (userRole !== 'owner') return;
    try {
      const newIsPublic = await toggleNotePublic(noteId);
      setIsPublic(newIsPublic);
      dispatch(moveNoteBetweenFolders({ noteId, isPublic: newIsPublic, title: noteTitle || 'Note' }));
    } catch (e) {
      console.error('Error toggling public:', e);
    }
  };

  // Keyboard shortcut for toggling sidebar (Cmd+Shift+\ or Ctrl+Shift+\)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\' && e.shiftKey) {
        e.preventDefault();
        if (isOwnNote && !isPublicNote) {
          setSidebarVisible(prev => {
            const newVisible = !prev;
            if (newVisible && auth.currentUser && !lastUpdated) {
              // Sidebar lazy load
              dispatch({ type: 'sidebar/loadSidebarData' });
            }
            return newVisible;
          });
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOwnNote, isPublicNote, auth.currentUser, lastUpdated, dispatch]);

  // Load sidebar data when sidebar becomes visible for own notes
  useEffect(() => {
    if (sidebarVisible && auth.currentUser && isOwnNote && !isPublicNote && !lastUpdated) {
      // dispatch(loadSidebarData()) without importing to avoid circulars, use type only action
      dispatch({ type: 'sidebar/loadSidebarData' });
    }
  }, [sidebarVisible, auth.currentUser, isOwnNote, isPublicNote, lastUpdated, dispatch]);

  const handleSaveTitle = (title: string) => {
    if (!selectedPageId) return;
    sidebarRef.current?.renamePage(selectedPageId, title);
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
  };

  if (!noteId || !subNoteId) {
    return <div className="p-6">Invalid sub-note URL</div>;
  }

  if (isCheckingAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)] text-[color:var(--foreground)]">
        <div>Loading sub-note...</div>
      </div>
    );
  }

  if ((isPublicNote && !isOwnNote) || !auth.currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--background)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Public Note Access</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">This is a public sub-note. Please sign in to edit in the markdown editor.</p>
          <Link href="/signin" className="text-blue-600 hover:text-blue-800 underline">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <EditModeProvider initialEditMode={true}>
      <div className="flex min-h-screen text-sm sm:text-base text-[color:var(--foreground)] relative">
        {sidebarVisible && (
          <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
        )}
        <div className="flex-1 flex flex-col">
          <Header
            isPublic={isPublic}
            onTogglePublic={handleTogglePublic}
            userRole={userRole}
            onFavoriteToggle={() => sidebarRef.current?.refreshFavorites()}
          />
          <MarkdownEditor
            key={selectedPageId}
            pageId={selectedPageId}
            onSaveTitle={handleSaveTitle}
            isPublic={isPublic}
            templateId={searchParams.get('template')}
            templateTitle={searchParams.get('title')}
          />
        </div>
      </div>
    </EditModeProvider>
  );
}

