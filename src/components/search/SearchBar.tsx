'use client';
import React from 'react';
import { InputBase, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';

interface SearchBarProps {
  searchQuery: string;
  isSearching: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export default function SearchBar({ 
  searchQuery, 
  isSearching, 
  onInputChange, 
  onClear, 
  inputRef 
}: SearchBarProps) {
  return (
    <div className="relative">
      <InputBase
        ref={inputRef}
        placeholder="Search public notes..."
        value={searchQuery}
        onChange={onInputChange}
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
                onClick={onClear}
              />
            )}
          </InputAdornment>
        }
      />
    </div>
  );
}