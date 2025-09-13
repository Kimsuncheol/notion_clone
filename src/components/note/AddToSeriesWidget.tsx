import { grayColor1, mintColor1 } from '@/constants/color';
import { TextField } from '@mui/material';
import React, { useState, useMemo, useEffect } from 'react';
import { ngramSearch } from '@/utils/ngram';
import { createSeries, subscribeToSeries } from '@/services/markdown/firebase';
import { useMarkdownStore } from '@/store/markdownEditorContentStore';
import { MySeries } from '@/types/firebase';

interface AddToSeriesWidgetProps {
  setIsAddToSeriesWidgetOpen: (isOpen: boolean) => void;
}

export default function AddToSeriesWidget({ setIsAddToSeriesWidgetOpen }: AddToSeriesWidgetProps) {
  const { selectedSeries, setSelectedSeries } = useMarkdownStore();
  const [newSeriesName, setNewSeriesName] = useState('');
  const { series, setSeries } = useMarkdownStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSeries, setIsCreatingSeries] = useState(false);

  // Configure n-gram search settings
  const searchConfig = useMemo(() => ({
    n: 2,
    caseSensitive: false,
    includeSpaces: false,
    threshold: 0.2,
    maxResults: 10,
    algorithm: 'jaccard' as const
  }), []);

  // Set up real-time series subscription
  useEffect(() => {
    const unsubscribe = subscribeToSeries((updatedSeries) => {
      setSeries(updatedSeries);
      setIsLoading(false);
    });

    // Cleanup subscription on component unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [setSeries]);

  // Filter series options based on n-gram search - FIXED to return SeriesType[]
  const filteredSeries = useMemo(() => {
    console.log('filteredSeries series: ', series);
    if (!newSeriesName.trim()) {
      return series; // Return SeriesType[] directly
    }

    // Perform n-gram search on titles, then map back to SeriesType objects
    const searchResults = ngramSearch(newSeriesName, series.map((s) => s.title), searchConfig);
    
    // If we have search results, return them in order of relevance
    if (searchResults.length > 0) {
      return searchResults.map(result => 
        series.find(s => s.title === result.item)
      ).filter(Boolean) as MySeries[]; // Map titles back to SeriesType objects
    }

    // If no n-gram matches, fall back to simple substring matching
    const substringMatches = series.filter(s =>
      s.title.toLowerCase().includes(newSeriesName.toLowerCase())
    );

    return substringMatches;
  }, [newSeriesName, series, searchConfig]);

  const handleSeriesSelect = (series: MySeries) => {
    setSelectedSeries(series);
    setNewSeriesName(series.title); // Fill the input with selected series
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSeriesName(e.target.value);
    setSelectedSeries(null); // Clear selection when typing
  };

  const handleCreateNewSeries = async () => {
    if (newSeriesName.trim() && !series.some(s => s.title === newSeriesName.trim())) {
      setIsCreatingSeries(true);
      try {
        console.log('Creating new series:', newSeriesName.trim());
        await createSeries(newSeriesName.trim());
        // The series will be automatically updated via the real-time subscription
        setIsAddToSeriesWidgetOpen(false);
      } catch (error) {
        console.error('Failed to create series:', error);
        // Error handling - could show a toast or error message here
      } finally {
        setIsCreatingSeries(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (filteredSeries.length === 1) {
        // If only one option matches, select it
        handleSeriesSelect(filteredSeries[0]); // Now passes SeriesType object
        setIsAddToSeriesWidgetOpen(false);
      } else if (newSeriesName.trim() && !series.some(s => s.title === newSeriesName.trim())) {
        // Create new series if it doesn't exist
        console.log('Creating new series:', newSeriesName.trim());
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
      {isLoading ? (
        <div className="py-4 px-2 text-white text-base text-center">
          Loading series...
        </div>
      ) : newSeriesName.trim() && filteredSeries.length === 0 ? (
        <div 
          className={`py-4 px-2 text-white text-base border-b border-gray-600 ${
            isCreatingSeries ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
          onClick={isCreatingSeries ? undefined : handleCreateNewSeries}
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <span style={{ color: mintColor1 }}>
            {isCreatingSeries ? '⏳ Creating...' : '+ Create new series: '}
          </span>
          {!isCreatingSeries && (
            <>
              <span>&quot;</span>
              <span>{newSeriesName}</span>
              <span>&quot;</span>
            </>
          )}
        </div>
      ) : (
        <ul className="list-none p-0 m-0 max-h-60 overflow-y-auto no-scrollbar">
          {filteredSeries.map((seriesItem, index) => (
            <li
              key={seriesItem.id} // Use series.id instead of index
              className={`
                py-3 px-2 border-gray-600 text-white text-base font-bold 
                cursor-pointer transition-colors duration-200
                ${index === filteredSeries.length - 1 ? 'border-b-0' : 'border-b'}
                hover:bg-opacity-20 hover:bg-white
              `}
              onClick={() => {
                handleSeriesSelect(seriesItem); // Now passes SeriesType object
                // setIsAddToSeriesWidgetOpen(false);
              }}
              style={{
                backgroundColor: selectedSeries?.id === seriesItem.id ? mintColor1 : 'transparent' // Compare IDs
              }}
            >
              {/* Highlight matching parts if there's a search query */}
              {newSeriesName.trim() ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: highlightText(seriesItem.title, newSeriesName) // Use seriesItem.title
                  }}
                />
              ) : (
                seriesItem.title // Use seriesItem.title
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Show count of results when searching */}
      {!isLoading && newSeriesName.trim() && (
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
            setSelectedSeries(selectedSeries as MySeries);
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