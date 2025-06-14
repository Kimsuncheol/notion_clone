'use client';
import React, { useState, useEffect } from 'react';
import { fetchPublicNotes, searchPublicNotes, PublicNote } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function OpenNotesPage() {
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PublicNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const auth = getAuth(firebaseApp);
  const router = useRouter();

  // Load all public notes on component mount
  useEffect(() => {
    loadAllPublicNotes();
  }, []);

  const loadAllPublicNotes = async () => {
    setIsLoading(true);
    try {
      const notes = await fetchPublicNotes(0); // 0 means no limit
      setPublicNotes(notes);
    } catch (error) {
      console.error('Error loading public notes:', error);
      toast.error('Failed to load public notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPublicNotes(term, 50);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching notes:', error);
      toast.error('Failed to search notes');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/note/${noteId}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const displayNotes = searchTerm ? searchResults : publicNotes;

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-[color:var(--background)] sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xl font-bold">
            📝 Notion Clone
          </Link>
          <span className="text-gray-500">Open Notes</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20">
            ← Dashboard
          </Link>
          {auth.currentUser ? (
            <Link href="/note/initial" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20">
              My Workspace
            </Link>
          ) : (
            <Link href="/signin" className="rounded px-3 py-1 text-sm bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20">
              Sign In
            </Link>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search all public notes..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 text-lg border border-black/20 dark:border-white/20 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
              ) : (
                <span className="text-gray-400">🔍</span>
              )}
            </div>
          </div>
        </div>

        {/* Header with count */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {searchTerm ? 'Search Results' : 'All Public Notes'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLoading ? 'Loading...' : `${displayNotes.length} notes found`}
          </p>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
          </div>
        ) : displayNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No notes found matching your search.' : 'No public notes available yet.'}
            </p>
            {!searchTerm && (
              <p className="text-gray-400 text-sm mt-2">Be the first to share a note publicly!</p>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => handleNoteClick(note.id)}
                className="p-6 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all hover:shadow-lg"
              >
                <h3 className="font-semibold text-xl mb-3 line-clamp-2">{note.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-4">
                  {note.preview}
                </p>
                <div className="text-sm text-gray-500 space-y-1">
                  <div>By {note.authorName}</div>
                  <div>Updated {formatDate(note.updatedAt)}</div>
                  <div>Created {formatDate(note.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-12 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
} 