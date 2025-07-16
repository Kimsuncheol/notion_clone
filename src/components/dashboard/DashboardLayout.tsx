'use client';
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Container } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { loadSidebarData } from '@/store/slices/sidebarSlice';
import { fetchPublicNotes, PublicNote } from '@/services/firebase';
import toast from 'react-hot-toast';
import SidebarContainer from './SidebarContainer';
import CreateNoteForm from './CreateNoteForm';
import PublicNotesSection from './PublicNotesSection';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { NoteCreationProvider } from '@/contexts/NoteCreationContext';

interface DashboardLayoutProps {
  user: User | null;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user }) => {
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [askText, setAskText] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string>('initial');
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    loadPublicNotes();
    if (user) {
      dispatch(loadSidebarData());
    }
  }, [user, dispatch]);

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

  const handleSelectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    router.push(`/note/${pageId}`);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <NoteCreationProvider>
        <div className="flex min-h-screen text-sm sm:text-base bg-[color:var(--background)] text-[color:var(--foreground)]">
          <SidebarContainer
            user={user}
            sidebarVisible={sidebarVisible}
            setSidebarVisible={setSidebarVisible}
            selectedPageId={selectedPageId}
            onSelectPage={handleSelectPage}
          />
          <div className="flex-1 flex flex-col">
            <Container maxWidth="md" sx={{ py: 4, flex: 1 }}>
              <CreateNoteForm
                askText={askText}
                onAskTextChange={setAskText}
                isUserAuthenticated={!!user}
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
};

export default DashboardLayout; 