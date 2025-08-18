'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchPublicNotes, PublicNote } from '@/services/firebase';
import { useRouter } from 'next/navigation';
import { useColorStore } from '@/store/colorStore';
import toast from 'react-hot-toast';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

interface Props {
  onClose: () => void;
}

const SearchModal: React.FC<Props> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<PublicNote[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const backgroundColor = useColorStore(state => state.backgroundColor);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-modal-content')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleResultClick = useCallback((noteId: string) => {
    router.push(`/note/${noteId}`);
    onClose();
    setSearchTerm('');
    setSearchResults([]);
  }, [router, onClose]);

  // Handle Escape key and arrow navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (event.key === 'Enter' && selectedIndex >= 0) {
        event.preventDefault();
        handleResultClick(searchResults[selectedIndex].id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, searchResults, selectedIndex, handleResultClick]);

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchPublicNotes(term, 20);
      setSearchResults(results);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching notes:', error);
      toast.error('Failed to search notes');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/50" />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
        {/*  */}
        <div 
          className="w-full max-w-2xl mx-4 rounded-lg shadow-2xl search-modal-content"
          style={{ backgroundColor }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <SearchIcon className="text-blue-400" />
              <h2 className="text-lg font-semibold text-gray-100">
                Search Notes
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
              title="Close search"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Search Input */}
          <div className="p-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search public notes..."
                value={searchTerm}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchResults.length > 0 ? (
              <div className="divide-y divide-gray-700">
                {searchResults.map((note, index) => (
                  <div
                    key={note.id}
                    onClick={() => handleResultClick(note.id)}
                    className={`p-4 cursor-pointer transition-colors ${
                      index === selectedIndex 
                        ? 'bg-blue-600/20 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-100 truncate">
                          {note.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          By {note.authorName}
                        </p>
                        {note.publishContent && (
                          <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                            {note.publishContent}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0 text-xs text-gray-500">
                        {formatDate(note.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchTerm && !isSearching ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                  No results found
                </h3>
                <p className="text-gray-400">
                  Try searching with different keywords
                </p>
              </div>
            ) : !searchTerm ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">💡</div>
                <h3 className="text-lg font-semibold text-gray-200 mb-2">
                  Start typing to search
                </h3>
                <p className="text-gray-400">
                  Search through all public notes
                </p>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-700 text-center text-xs text-gray-400">
            Use ↑↓ to navigate • Enter to select • Esc to close
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchModal; 