'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, Avatar, Chip, Typography, InputBase, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { searchPageResultCardBgColor, settingsPageMintColor } from '@/constants/color';
import { searchPublicNotes, PublicNote } from '@/services/firebase';
import toast from 'react-hot-toast';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  date: Date;
  commentsCount: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams?.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Focus input when page loads
  useEffect(() => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  // Convert Firebase PublicNote to SearchResult format
  const convertToSearchResults = useCallback((notes: PublicNote[]): SearchResult[] => {
    return notes.map(note => ({
      id: note.id,
      title: note.title,
      content: note.publishContent || '',
      thumbnail: note.thumbnail,
      author: note.authorName || 'Anonymous',
      authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      tags: ['React', 'Frontend', 'Development'], // Mock tags for now - you can enhance this
      date: note.updatedAt,
      commentsCount: Math.floor(Math.random() * 50) + 1 // Mock comment count
    }));
  }, []);

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
      const results = convertToSearchResults(notes);
      setSearchResults(results);
      setTotalResults(results.length);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error searching notes:', error);
      toast.error('Failed to search notes');
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setIsSearching(false);
    }
  }, [convertToSearchResults]);

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
    router.replace(`/search?${newSearchParams.toString()}`, { scroll: false });

    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchParams, router, handleSearch]);

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
          router.push(`/note/${selectedResult.id}`);
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

  const handleResultClick = useCallback((noteId: string) => {
    router.push(`/note/${noteId}`);
  }, [router]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Search Bar */}
          <div className="relative">
            <InputBase
              ref={searchInputRef}
              placeholder="Search public notes..."
              value={searchQuery}
              onChange={handleInputChange}
              sx={{
                width: '100%',
                p: '12px',
                bg: 'gray.800',
                border: '1px solid #fff',
                color: '#fff',
                borderRadius: '8px',
              }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#fff' }} />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  {isSearching && (
                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-blue-500 rounded-full mr-2"></div>
                  )}
                  {searchQuery.length > 0 && (
                    <ClearOutlinedIcon 
                      sx={{ color: '#fff', cursor: 'pointer' }} 
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                        setTotalResults(0);
                        router.replace('/search', { scroll: false });
                      }}
                    />
                  )}
                </InputAdornment>
              }
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Count */}
        {searchQuery && (
          <div className="mb-6">
            <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
              {isSearching ? (
                'Searching...'
              ) : (
                <>
                  총 <span className="font-semibold text-green-600">{totalResults.toLocaleString()}</span>개의 포스트를 찾았습니다.
                </>
              )}
            </Typography>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-8">
          {searchResults.map((result, index) => (
            <div
              key={result.id}
              className={`cursor-pointer transition-colors ${
                index === selectedIndex 
                  ? 'bg-blue-600/20 border-l-4 border-blue-500 pl-4' 
                  : ''
              }`}
              onClick={() => handleResultClick(result.id)}
            >
              <ResultCard result={result} />
            </div>
          ))}
        </div>

        {/* No Results */}
        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <Typography variant="h6" className="text-gray-500 dark:text-gray-400 mb-2">
              검색 결과가 없습니다
            </Typography>
            <Typography variant="body2" className="text-gray-400 dark:text-gray-500">
              다른 키워드로 검색해보세요
            </Typography>
          </div>
        )}

        {/* Initial State */}
        {!searchQuery && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💡</div>
            <Typography variant="h6" className="text-gray-500 dark:text-gray-400 mb-2">
              Start typing to search
            </Typography>
            <Typography variant="body2" className="text-gray-400 dark:text-gray-500">
              Search through all public notes
            </Typography>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                {/* Author Info Skeleton */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>

                <div className="flex gap-6">
                  {/* Content Skeleton */}
                  <div className="flex-1">
                    {/* Title Skeleton */}
                    <div className="w-3/4 h-6 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>

                    {/* Description Skeleton */}
                    <div className="space-y-2 mb-4">
                      <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-2/3 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>

                    {/* Tags Skeleton */}
                    <div className="flex gap-2 mb-4">
                      <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="w-18 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    </div>

                    {/* Meta Info Skeleton */}
                    <div className="flex gap-4">
                      <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>

                  {/* Thumbnail Skeleton */}
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ result }: { result: SearchResult }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content
  }

  // The width of the card
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWidth: number = cardRef.current?.clientWidth || 0;

  return (
    <Card key={result.id} className="result-card" ref={cardRef} sx={{
      border: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      transition: 'all 0.2s ease-in-out',
      color: '#fff',
      '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-2px)',
      }
    }}>
      <CardContent sx={{
        padding: '0px'
      }}>
        <div className="">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={result.authorAvatar}
              alt={result.author}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" className="font-medium text-gray-700 dark:text-gray-300">
              {result.author}
            </Typography>
          </div>

          <div className="flex gap-6">
            {/* Content */}
            <div className="flex-1 flex flex-col gap-4">
              {result.thumbnail && (
                <div className="">
                  <Image
                    src={result.thumbnail}
                    alt={result.title}
                    width={cardWidth}
                    height={cardWidth * 0.75}
                    objectFit="contain"
                  />
                </div>
              )}

              {/* Title */}
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  lineHeight: '1.4',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#3b82f6',
                  }
                }}
              >
                {result.title}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  lineHeight: '1.4',
                  color: 'text.secondary',
                }}
              >
                {truncateContent(result.content)}
              </Typography>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4 text-sm">
                {result.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderColor: 'transparent',
                      backgroundColor: searchPageResultCardBgColor,
                      padding: '16px 8px',
                      color: settingsPageMintColor,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  />
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(result.date)}</span>
                <span>&#8226;</span>
                <span>{result.commentsCount}개의 댓글</span>
                <span>&#8226;</span>
                <span>&#10084;</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}