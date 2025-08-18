import React, { useState, useEffect, useMemo } from 'react';
import { Dayjs } from 'dayjs';
import { fetchAllNotesWithStatus } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import SearchIcon from '@mui/icons-material/Search';
import NoteAltIcon from '@mui/icons-material/NoteAlt';

interface NotesArchiveModalProps {
  onClose: () => void;
  onBackToCalendar: () => void;
  selectedDate: Dayjs | null;
  onNoteSelect: (noteId: string) => void;
}

interface NoteItem {
  pageId: string;
  title: string;
  isPublic: boolean;
  isTrashed: boolean;
  createdAt: Date;
}

const NotesArchiveModal: React.FC<NotesArchiveModalProps> = ({ 
  onClose, 
  onBackToCalendar,
  selectedDate, 
  onNoteSelect 
}) => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = getAuth(firebaseApp);

  // Load notes when modal opens
  useEffect(() => {
    if (auth.currentUser) {
      loadNotes();
    }
  }, [auth.currentUser]);

  const loadNotes = async () => {
    setIsLoading(true);
    try {
      const allNotes = await fetchAllNotesWithStatus();
      setNotes(allNotes);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter notes by selected date and search term
  const filteredNotes = useMemo(() => {
    if (!selectedDate) return [];

    let dateFilteredNotes = notes;

    // Filter by selected date
    if (selectedDate) {
      const selectedDateStr = selectedDate.format('YYYY-MM-DD');
      dateFilteredNotes = notes.filter(note => {
        const noteDate = note.createdAt.toISOString().split('T')[0];
        return noteDate === selectedDateStr;
      });
    }

    // Filter by search term
    if (searchTerm.trim()) {
      dateFilteredNotes = dateFilteredNotes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Exclude trashed notes
    return dateFilteredNotes.filter(note => !note.isTrashed);
  }, [notes, selectedDate, searchTerm]);

  const handleNoteClick = (noteId: string) => {
    onNoteSelect(noteId);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="text-white text-sm bg-black/50 flex flex-col gap-2 w-96 h-96 rounded-lg p-4 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">
            Notes Archive {selectedDate && `- ${selectedDate.format('MMM DD, YYYY')}`}
          </h3>
          <button
            onClick={onBackToCalendar}
            className="text-white hover:text-gray-300 text-xl font-bold w-8 h-8 flex items-center justify-center"
            title="Back to calendar"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-2">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon fontSize="small" className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading notes...</div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <NoteAltIcon fontSize="large" className="mb-2" />
              <p>
                {selectedDate 
                  ? `No notes found for ${selectedDate.format('MMM DD, YYYY')}`
                  : 'No date selected'
                }
              </p>
              {searchTerm && (
                <p className="text-xs mt-1">
                  Try adjusting your search term
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((note) => (
                <div
                  key={note.pageId}
                  onClick={() => handleNoteClick(note.pageId)}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800 hover:bg-gray-700 cursor-pointer transition-colors"
                >
                  <NoteAltIcon fontSize="small" className="text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{note.title || 'Untitled'}</span>
                      {note.isPublic && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                          Public
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Created: {note.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Info */}
        {!isLoading && filteredNotes.length > 0 && (
          <div className="text-xs text-gray-400 pt-2 border-t border-gray-700">
            Found {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesArchiveModal; 