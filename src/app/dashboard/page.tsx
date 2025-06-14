'use client';
import React, { useState, useEffect } from 'react';
import { fetchPublicNotes, searchPublicNotes, PublicNote } from '@/services/firebase';
import { getAuth } from 'firebase/auth';
import { firebaseApp } from '@/constants/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function DashboardPage() {
  const [publicNotes, setPublicNotes] = useState<PublicNote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PublicNote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const auth = getAuth(firebaseApp);
  const router = useRouter();

  // Load public notes on component mount
  useEffect(() => {
    loadPublicNotes();
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

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPublicNotes(term, 10);
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
    // Navigate to the public note view
    router.push(`/note/${noteId}`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)]">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-black/10 dark:border-white/10 bg-[color:var(--background)] sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <Link href="/note/initial" className="text-xl font-bold">
            📝 Notion Clone
          </Link>
          <span className="text-gray-500">Dashboard</span>
        </div>
        
        <div className="flex items-center gap-4">
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
              placeholder="Search public notes..."
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

        {/* Search Results */}
        {searchTerm && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">
              Search Results {searchResults.length > 0 && `(${searchResults.length})`}
            </h2>
            {searchResults.length === 0 && !isSearching ? (
              <p className="text-gray-500 text-center py-8">No notes found matching your search.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {searchResults.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => handleNoteClick(note.id)}
                    className="p-4 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{note.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                      {note.preview}
                    </p>
                    <div className="text-xs text-gray-500">
                      Updated {formatDate(note.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Public Notes Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Public Notes</h2>
            <Link
              href="/open-notes"
              className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
            >
              View More →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
            </div>
          ) : publicNotes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No public notes available yet.</p>
              <p className="text-gray-400 text-sm mt-2">Be the first to share a note publicly!</p>
            </div>
          ) : (
            <div className="flex justify-around items-start gap-6 flex-wrap">
              {publicNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className="flex-1 min-w-[280px] max-w-[320px] p-6 border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all hover:shadow-lg"
                >
                  <h3 className="font-semibold text-xl mb-3 line-clamp-2">{note.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-4">
                    {note.preview}
                  </p>
                  <div className="text-sm text-gray-500">
                    Updated {formatDate(note.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 