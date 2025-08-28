import { grayColor1, mintColor1 } from '@/constants/color';
import { TextField } from '@mui/material';
import React, { useState, useMemo } from 'react';
import { ngramSearch, SearchConfig } from '@/utils/ngram';

const seriesOptions = [
  'Vue',
  'React',
  '컴퓨터구조',
  '알고리즘및실습',
  '이산수학',
  '세계사',
];

interface AddToSeriesWidgetProps {
  setIsAddToSeriesWidgetOpen: (isOpen: boolean) => void;
  onSelectSeries: (series: string) => void;
}

export default function AddToSeriesWidget({ setIsAddToSeriesWidgetOpen, onSelectSeries }: AddToSeriesWidgetProps) {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [newSeriesName, setNewSeriesName] = useState('');

  // Configure n-gram search settings
  const searchConfig: SearchConfig = {
    n: 2, // Use bigrams for better Korean text matching
    caseSensitive: false,
    includeSpaces: false,
    threshold: 0.2, // Lower threshold for more flexible matching
    maxResults: 10,
    algorithm: 'jaccard'
  };

  // Filter series options based on n-gram search
  const filteredSeries = useMemo(() => {
    if (!newSeriesName.trim()) {
      return seriesOptions;
    }

    // Perform n-gram search
    const searchResults = ngramSearch(newSeriesName, seriesOptions, searchConfig);
    
    // If we have search results, return them in order of relevance
    if (searchResults.length > 0) {
      return searchResults.map(result => result.item);
    }

    // If no n-gram matches, fall back to simple substring matching
    const substringMatches = seriesOptions.filter(series =>
      series.toLowerCase().includes(newSeriesName.toLowerCase())
    );

    return substringMatches.length > 0 ? substringMatches : [];
  }, [newSeriesName]);

  const handleSeriesSelect = (series: string) => {
    setSelectedSeries(series);
    setNewSeriesName(series); // Fill the input with selected series
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSeriesName(e.target.value);
    setSelectedSeries(''); // Clear selection when typing
  };

  const handleCreateNewSeries = () => {
    if (newSeriesName.trim() && !seriesOptions.includes(newSeriesName.trim())) {
      // Logic to create new series would go here
      console.log('Creating new series:', newSeriesName.trim());
      setIsAddToSeriesWidgetOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (filteredSeries.length === 1) {
        // If only one option matches, select it
        handleSeriesSelect(filteredSeries[0]);
        setIsAddToSeriesWidgetOpen(false);
      } else if (newSeriesName.trim() && !seriesOptions.includes(newSeriesName.trim())) {
        // Create new series if it doesn't exist
        handleCreateNewSeries();
      }
    }
  };

  return (
    <div className="px-6 pb-6 min-w-96 max-w-md rounded-lg font-sans">
      <div className='text-white text-lg font-bold mb-4'>Series Setting</div>
      <TextField 
        placeholder="Enter a new series name or search existing"
        variant="outlined"
        fullWidth
        value={newSeriesName}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        sx={{
          marginBottom: '12px',
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: mintColor1,
              borderWidth: '2px',
            },
            '& input': {
              color: '#ffffff',
              fontSize: '16px',
              padding: '14px 16px',
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '16px',
            '&.Mui-focused': {
              color: mintColor1,
            },
          },
          '& .MuiInputLabel-shrink': {
            transform: 'translate(14px, -9px) scale(0.75)',
            backgroundColor: grayColor1,
            padding: '0 8px',
          },
        }}
      />

      {/* Show filtered results or message */}
      {newSeriesName.trim() && filteredSeries.length === 0 ? (
        <div 
          className="py-4 px-2 text-white text-base cursor-pointer border-b border-gray-600"
          onClick={handleCreateNewSeries}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <span style={{ color: mintColor1 }}>+ Create new series: &quot;</span>
          <span>{newSeriesName}</span>
          <span style={{ color: mintColor1 }}>&quot;</span>
        </div>
      ) : (
        <ul className="list-none p-0 m-0 max-h-60 overflow-y-auto no-scrollbar">
          {filteredSeries.map((series, index) => (
            <li
              key={index}
              className={`
                py-3 px-2 border-gray-600 text-white text-base font-bold 
                cursor-pointer transition-colors duration-200
                ${index === filteredSeries.length - 1 ? 'border-b-0' : 'border-b'}
                hover:bg-opacity-20 hover:bg-white
              `}
              onClick={() => {
                handleSeriesSelect(series);
                // setIsAddToSeriesWidgetOpen(false);
              }}
              style={{
                backgroundColor: selectedSeries === series ? mintColor1 : 'transparent'
              }}
            >
              {/* Highlight matching parts if there's a search query */}
              {newSeriesName.trim() ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightText(series, newSeriesName)
                  }}
                />
              ) : (
                series
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Show count of results when searching */}
      {newSeriesName.trim() && (
        <div className="mt-2 text-xs text-gray-400">
          {filteredSeries.length > 0 
            ? `${filteredSeries.length} series found` 
            : 'No existing series found'
          }
        </div>
      )}
      {/* Cancel button and Select button */}
      <div className="flex items-center justify-end gap-4 mt-4">
        <div className='text-sm cursor-pointer hover:bg-[rgba(255,255,255,0.1)] font-bold px-3 py-2 rounded-md' style={{ color: mintColor1 }} onClick={() => setIsAddToSeriesWidgetOpen(false)}>
          Cancel
        </div>
        <div className={`text-sm cursor-pointer font-bold px-3 py-2 rounded-md text-black`} style={{ backgroundColor: mintColor1 }} onClick={
          () => {
            onSelectSeries(selectedSeries);
            setIsAddToSeriesWidgetOpen(false);
          }
        }>
          Select
        </div>
      </div>
    </div>
  );
}

// Helper function to highlight matching text
function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, `<span style="background-color: ${mintColor1}; color: black; padding: 0 2px; border-radius: 2px;">$1</span>`);
}
