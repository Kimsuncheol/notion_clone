'use client';
import React from 'react';
import SearchBar from './SearchBar';
import SearchTermsRecommendedByAI from './SearchTermsRecommendedByAI';

interface SearchHeaderProps {
  searchQuery: string;
  isSearching: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  onTermClick: (term: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function SearchHeader({
  searchQuery,
  isSearching,
  onInputChange,
  onClear,
  onTermClick,
  inputRef
}: SearchHeaderProps) {
  return (
    <div className="text-white py-8" id="search-header">
      <div className="max-w-4xl mx-auto px-4 flex flex-col gap-8">
        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          isSearching={isSearching}
          onInputChange={onInputChange}
          onClear={onClear}
          inputRef={inputRef}
        />

        {/* AI Recommended Search Terms */}
        {!searchQuery && (
          <SearchTermsRecommendedByAI onTermClick={onTermClick} />
        )}
      </div>
    </div>
  );
}