'use client';
import React, { memo, useMemo } from 'react';
import { Chip, Typography, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchTermsRecommendedByAIProps {
  recommendedTerms: string[];
  isLoading: boolean;
  onTermClick: (term: string) => void;
}

const FALLBACK_TERMS = [
  'React',
  'TypeScript',
  'Next.js',
  'JavaScript',
  'Node.js',
  'Python',
  'Machine Learning',
  'Web Development',
  'Database',
  'API Design'
];

const SearchTermsRecommendedByAI = memo(function SearchTermsRecommendedByAI({ 
  recommendedTerms,
  isLoading,
  onTermClick 
}: SearchTermsRecommendedByAIProps) {
  const { displayTerms, isPersonalized } = useMemo(() => {
    const hasPersonalizedTerms = recommendedTerms.length > 0;
    return {
      displayTerms: hasPersonalizedTerms ? recommendedTerms : FALLBACK_TERMS,
      isPersonalized: hasPersonalizedTerms,
    };
  }, [recommendedTerms]);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h5" 
        sx={{ 
          color: '#fff', 
          mb: 2, 
          fontWeight: 500
        }}
      >
        {isPersonalized ? 'Recommended for You' : 'Suggested Search Terms'}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          mb: 2,
          maxWidth: 600,
        }}
      >
        {isLoading
          ? 'Analyzing your recently read notes to personalize search suggestions...'
          : isPersonalized
            ? 'Tap a keyword to search based on your recent reading activity.'
            : 'Tap a keyword to start exploring popular topics.'}
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: 1.5
      }}>
        {displayTerms.map(term => (
          <Chip
            icon={<SearchIcon sx={{ color: 'white' }} />}
            key={term}
            label={term}
            onClick={() => onTermClick(term)}
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'medium',
              padding: '16px 8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
          />
        ))}
      </Box>
    </Box>
  );
});

export default SearchTermsRecommendedByAI;