'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { searchPublicNotes } from '@/services/search/firebase';
import { fetchUserInfo } from '@/services/lists/liked/firebase';
import { generateRecommendedSearchKeywords } from '@/services/search/recommendation';
import { FirebaseNoteContent } from '@/types/firebase';
import toast from 'react-hot-toast';
import SearchHeader from '@/components/search/SearchHeader';
import SearchResults from '@/components/search/SearchResults';
import SearchLoadingSkeleton from '@/components/search/SearchLoadingSkeleton';
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail';

interface SearchPageProps {
  params: Promise<{
    userId: string;
  }>
}

export default function SearchPage({ params }: SearchPageProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { userId } = React.use(params);
  console.log('userId in search: ', userId);
  const userEmail = convertToNormalUserEmail(userId);
  const initialQuery = searchParams?.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<FirebaseNoteContent[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [recommendedTerms, setRecommendedTerms] = useState<string[]>([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)

  // Focus input when page loads
  useEffect(() => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  // Fetch recommended search keywords based on recently read notes
  useEffect(() => {
    let isActive = true;

    const fetchRecommendations = async () => {
      try {
        setIsLoadingRecommendations(true);
        const { id: actualUserId } = await fetchUserInfo(userEmail);
        if (!actualUserId) {
          if (isActive) {
            setRecommendedTerms([]);
          }
          return;
        }

        const keywords = await generateRecommendedSearchKeywords(actualUserId, { limit: 10 });
        if (isActive) {
          setRecommendedTerms(keywords);
        }
      } catch (error) {
        console.error('Error generating recommended search keywords:', error);
        if (isActive) {
          setRecommendedTerms([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingRecommendations(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      isActive = false;
    };
  }, [userEmail]);

  // Debounced search function
  const handleSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      return;
    }

    setIsSearching(true);
    try {
      const notes = await searchPublicNotes(term, 50); // Get more results
      setSearchResults(notes);
      setTotalResults(notes.length);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching notes:', error);
      toast.error('Failed to search notes');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle input change with debouncing
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // Update URL with search query
    const newSearchParams = new URLSearchParams(searchParams?.toString());
    if (value.trim()) {
      newSearchParams.set('q', value);
    } else {
      newSearchParams.delete('q');
    }
    router.replace(`/${userEmail}/search?${newSearchParams.toString()}`, { scroll: false });

    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchParams, router, handleSearch, userEmail]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
      } else if (event.key === 'Enter' && selectedIndex >= 0) {
        event.preventDefault();
        const selectedResult = searchResults[selectedIndex];
        if (selectedResult) {
          router.push(`/${selectedResult.authorEmail}/note/${selectedResult.id}`);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchResults, selectedIndex, router]);

  // Search on initial load if query exists
  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery, handleSearch]);

  const handleResultClick = useCallback((result: FirebaseNoteContent) => {
    router.push(`/${result.authorEmail}/note/${result.id}`);
  }, [router]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setTotalResults(0);
    router.replace(`/${userId}/search`, { scroll: false });
  }, [router, userId]);

  const handleTermClick = useCallback((term: string) => {
    setSearchQuery(term);
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('q', term);
    router.replace(`/${userId}/search?${newSearchParams.toString()}`, { scroll: false });
    handleSearch(term);
  }, [router, userId, handleSearch]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <SearchHeader
        searchQuery={searchQuery}
        isSearching={isSearching}
        onInputChange={handleInputChange}
        onClear={handleClearSearch}
        onTermClick={handleTermClick}
        inputRef={searchInputRef}
        recommendedTerms={recommendedTerms}
        isLoadingRecommendations={isLoadingRecommendations}
      />

      {/* Results */}
      {isSearching ? (
        <SearchLoadingSkeleton />
      ) : (
        <SearchResults
          searchQuery={searchQuery}
          searchResults={searchResults}
          totalResults={totalResults}
          isSearching={isSearching}
          selectedIndex={selectedIndex}
          onResultClick={handleResultClick}
        />
      )}
    </div>
  )
}