'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, Avatar, Chip, Typography, InputBase, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import Image from 'next/image'
import { useSearchParams, useRouter } from 'next/navigation'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { grayColor4, mintColor1 } from '@/constants/color';
import { searchPublicNotes } from '@/services/search/firebase';
import { FirebaseNoteContent } from '@/types/firebase';
import toast from 'react-hot-toast';
import SearchLoading from './loading';
import Link from 'next/link';


// search notes by title, content, tags
// search tags by name
export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams?.get('q') || ''
  const userEmail = window.location.pathname.split('/')[1]
  console.log('userEmail in search: ', userEmail);

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<FirebaseNoteContent[]>([])
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
    if (userEmail) {
      router.replace(`/${userEmail}/search?${newSearchParams.toString()}`, { scroll: false });
    } else {
      router.replace(`/search?${newSearchParams.toString()}`, { scroll: false });
    }

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
            <Link
              key={result.id}
              className={`cursor-pointer transition-colors ${index === selectedIndex
                  ? 'bg-blue-600/20 border-l-4 border-blue-500 pl-4'
                  : ''
                }`}
              href={`/${result.authorEmail}/note/${result.id}`}
            >
              <ResultCard result={result} />
            </Link>
          ))}
        </div>

        {/* No Results */}
        {searchResults.length === 0 && searchQuery && !isSearching && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">🔍</div>
            <Typography variant="h6" className="text-gray-500 dark:text-gray-400 mb-2">
              No search results
            </Typography>
            <Typography variant="body2" className="text-gray-400 dark:text-gray-500">
              Try searching with different keywords
            </Typography>
          </div>
        )}

        {/* Loading State */}
        {isSearching && <SearchLoading />}
      </div>
    </div>
  )
}

function ResultCard({ result }: { result: FirebaseNoteContent }) {
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
              src={'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
              alt={result.authorName || 'Anonymous'}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" className="font-medium text-gray-700 dark:text-gray-300">
              {result.authorName || 'Anonymous'}
            </Typography>
          </div>

          <div className="flex gap-6">
            {/* Content */}
            <div className="flex-1 flex flex-col gap-4">
              {result.thumbnailUrl && (
                <div className="">
                  <Image
                    src={result.thumbnailUrl}
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
                {result.tags && result.tags.length > 0 && result.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={typeof tag === 'string' ? tag : tag.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderColor: 'transparent',
                      backgroundColor: grayColor4,
                      padding: '16px 8px',
                      color: mintColor1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  />
                ))}
                {(!result.tags || result.tags.length === 0) && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">No tags</span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(result.updatedAt || result.createdAt)}</span>
                <span>&#8226;</span>
                <span>{result.comments?.length || 0}개의 댓글</span>
                <span>&#8226;</span>
                <span>&#10084; {result.likeCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}