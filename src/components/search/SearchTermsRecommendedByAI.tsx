'use client';
import React, { memo } from 'react';
import { Chip, Typography, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface SearchTermsRecommendedByAIProps {
  onTermClick: (term: string) => void;
}

const SearchTermsRecommendedByAI = memo(function SearchTermsRecommendedByAI({ 
  onTermClick 
}: SearchTermsRecommendedByAIProps) {
  const recommendedTerms = [
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
        Recommended Search Terms by AI
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: 1.5
      }}>
        {recommendedTerms.map((term, index) => (
          <Chip
            icon={<SearchIcon sx={{ color: 'white' }} />}
            key={index}
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