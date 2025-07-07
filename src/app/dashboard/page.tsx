'use client';
import React, { useState, useEffect, useRef } from 'react';
import { fetchPublicNotes, PublicNote, addNotePage } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Container } from '@mui/material';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadSidebarData, getFolderByType } from '@/store/slices/sidebarSlice';
import Sidebar, { SidebarHandle } from '@/components/Sidebar';
import Inbox from '@/components/Inbox';
import { useModalStore } from '@/store/modalStore';
import CreateNoteForm from '@/components/dashboard/CreateNoteForm';
import PublicNotesSection from '@/components/dashboard/PublicNotesSection';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NoteCreationProvider } from '@/contexts/NoteCreationContext';

export default function DashboardPage() {
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [askText, setAskText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('initial');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const { showInbox, setShowInbox, setUnreadNotificationCount } = useModalStore();
  const auth = getAuth(firebaseApp);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { folders } = useAppSelector((state) => state.sidebar);
  const sidebarRef = useRef<SidebarHandle>(null);

  useEffect(() => {
    loadPublicNotes();
    if (auth.currentUser) {
      dispatch(loadSidebarData());
    }
  }, [auth.currentUser, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarVisible(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadPublicNotes = async () => {
    setIsLoading(true);
    try {
      const notes = await fetchPublicNotes(5);
      setPublicNotes(notes);
    } catch (error) {
      console.error('Error loading public notes:', error);
      toast.error('Failed to load public notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

  const handleCreateNewNote = async () => {
    if (!auth.currentUser) {
      toast.error('Please sign in to create notes');
      return;
    }

    try {
      const privateFolder = getFolderByType(folders, 'private');
      if (!privateFolder) {
        toast.error('Private folder not found');
        return;
      }

      const pageId = await addNotePage(privateFolder.id, askText || 'Untitled');
      toast.success('New note created');
      router.push(`/note/${pageId}`);
    } catch (error) {
      console.error('Error creating note:', error);
      toast.error('Failed to create note');
    }
  };

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    router.push(`/note/${pageId}`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <NoteCreationProvider>
        <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
          {auth.currentUser && sidebarVisible && (
            <Sidebar ref={sidebarRef} selectedPageId={selectedPageId} onSelectPage={handleSelectPage} />
          )}
          {auth.currentUser && showInbox && (
            <Inbox
              open={showInbox}
              onClose={() => setShowInbox(false)}
              onNotificationCountChange={setUnreadNotificationCount}
            />
          )}
          <div className="flex-1 flex flex-col">
            <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
              <CreateNoteForm
                askText={askText}
                onAskTextChange={setAskText}
                onCreateNewNote={handleCreateNewNote}
                isUserAuthenticated={!!auth.currentUser}
                onFilesSelect={setSelectedFiles}
                selectedFiles={selectedFiles}
              />

              <PublicNotesSection
                publicNotes={publicNotes}
                isLoading={isLoading}
                onNoteClick={handleNoteClick}
              />
            </Container>
          </div>
        </div>
      </NoteCreationProvider>
    </DndProvider>
  );
} 