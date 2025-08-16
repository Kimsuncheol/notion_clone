import { Chip } from '@mui/material';
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSelectedCategory } from '@/store/slices/dashboardSlice';

// Define available categories
const CATEGORIES = ['All', 'Frontend', 'Backend', 'Design', 'Mobile'];

export default function ChipsBar() {
  const dispatch = useAppDispatch();
  const selectedCategory = useAppSelector(state => state.dashboard.selectedCategory);

  const handleCategoryClick = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  return (
    <div className='w-full h-10 flex items-center gap-2 overflow-x-auto'>
      {CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={category}
          variant={selectedCategory === category ? 'filled' : 'outlined'}
          onClick={() => handleCategoryClick(category)}
          sx={{
            cursor: 'pointer',
            backgroundColor: selectedCategory === category ? '#3b82f6' : 'transparent',
            color: 'white',
            borderColor: selectedCategory === category ? '#3b82f6' : '#d1d5db',
            '&:hover': {
              backgroundColor: selectedCategory === category ? '#2563eb' : '#f3f4f6',
            },
            transition: 'all 0.2s ease-in-out',
            fontSize: '0.875rem',
            height: '32px'
          }}
        />
      ))}
    </div>
  );
}
