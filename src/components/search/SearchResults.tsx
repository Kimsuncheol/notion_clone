'use client';
import React from 'react';
import { Typography } from '@mui/material';
import { FirebaseNoteContent } from '@/types/firebase';
import ResultCard from './ResultCard';

interface SearchResultsProps {
  searchQuery: string;
  searchResults: FirebaseNoteContent[];
  totalResults: number;
  isSearching: boolean;
  selectedIndex: number;
  onResultClick: (result: FirebaseNoteContent) => void;
}

export default function SearchResults({ 
  searchQuery,
  searchResults, 
  totalResults, 
  isSearching, 
  selectedIndex,
  onResultClick 
}: SearchResultsProps) {
  if (!searchQuery) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Results Count */}
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
            onClick={() => onResultClick(result)}
          >
            <ResultCard result={result} />
          </div>
        ))}
      </div>

      {/* No Results */}
      {searchResults.length === 0 && !isSearching && (
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
    </div>
  );
}