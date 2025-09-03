'use client';

import React, { useState, useEffect } from 'react';
import { getDraftedNotes, deleteDraftedNote } from '@/services/drafts/firebase';
import { DraftedNote } from '@/types/firebase';
import DraftsPageHeader from '@/components/drafts/DraftsPageHeader';
import DraftedNoteItem from '@/components/drafts/DraftedNoteItem';
import { grayColor2, grayColor3 } from '@/constants/color';
import { Alert } from '@mui/material';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/markdown/DeleteConfirmationModal';
import { useMarkdownEditorContentStore } from '@/store/markdownEditorContentStore';

export default function DraftsPage() {
  const [draftedNotes, setDraftedNotes] = useState<DraftedNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { deleteNoteId, showDeleteConfirmation } = useMarkdownEditorContentStore();

  // Load saved notes
  const loadSavedNotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const draftedNotes = await getDraftedNotes();
      setDraftedNotes(draftedNotes);
    } catch (err) {
      console.error('Error loading saved notes:', err);
      setError('Failed to load saved notes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSavedNotes();
  }, []);

  // Handle delete note
  const handleDeleteNote = async (id: string) => {
    try {
      await deleteDraftedNote(id);
      setDraftedNotes(prev => prev.filter(note => note.id !== id));
      toast.success('저장된 글이 삭제되었습니다.');
    } catch (err) {
      console.error('Error deleting note:', err);
      toast.error('글 삭제에 실패했습니다.');
    }
  };

  if (isLoading) {
    // Loading skeleton is handled by loading.tsx
    return null;
  }

  return (
    <div className="p-6 min-h-screen">
      { showDeleteConfirmation && <DeleteConfirmationModal pageId={deleteNoteId} /> }
      
      <div className="max-w-2xl mx-auto">
      <DraftsPageHeader />
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 4,
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: '#dc2626',
              '& .MuiAlert-icon': {
                color: '#dc2626'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {draftedNotes.length === 0 && !error ? (
          <div 
            className="text-center py-12 rounded-lg"
            style={{ backgroundColor: grayColor2 }}
          >
            <div className="mb-4">
              <svg 
                className="w-16 h-16 mx-auto opacity-50" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                style={{ color: grayColor3 }}
              >
                <path 
                  fillRule="evenodd" 
                  d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <p 
              className="text-lg mb-2"
              style={{ color: grayColor3 }}
            >
              No drafted notes
            </p>
            <p 
              className="text-sm opacity-60"
              style={{ color: grayColor3 }}
            >
              When you save a draft, it&apos;ll show up here.
            </p>
          </div>
        ) : (
          <div className='flex flex-col gap-0'>
            {draftedNotes.map((note, index) => (
              <DraftedNoteItem
                key={note.id}
                note={note}
                onDelete={handleDeleteNote}
                lastItem={index === draftedNotes.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}