"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { EditModeProvider } from '@/contexts/EditModeContext';
import Header from '@/components/Header';
import MarkdownEditor from '@/components/MarkdownEditor';
import Sidebar, { SidebarHandle } from '@/components/Sidebar';
import Link from 'next/link';
import { fetchNoteContent, fetchPublicNoteContent, toggleNotePublic } from '@/services/firebase';
import { useAppDispatch } from '@/store/hooks';
import { moveNoteBetweenFolders } from '@/store/slices/sidebarSlice';
import { useIsPublicNoteStore } from '@/store/isPublicNoteStore';
import { useAddaSubNoteSidebarStore } from '@/store/AddaSubNoteSidebarStore';

export default function SubNotePage() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const auth = getAuth(firebaseApp);
  const dispatch = useAppDispatch();
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
      <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)] relative">
        <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={(id) => setSelectedPageId(id)} />
        <div className="flex-1 flex flex-col">
          <Header
            isPublic={isPublic}
            onTogglePublic={handleTogglePublic}
            userRole={userRole}
            onFavoriteToggle={() => { /* no-op for sub-note */ }}
          />
          <MarkdownEditor
            key={selectedPageId}
            pageId={selectedPageId}
            onSaveTitle={() => { /* Sidebar rename not used here */ }}
            isPublic={isPublic}
            templateId={searchParams.get('template')}
            templateTitle={searchParams.get('title')}
          />
        </div>
      </div>
    </EditModeProvider>
  );
}

