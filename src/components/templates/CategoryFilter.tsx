"use client";

import React from 'react';

interface CategoryItem {
  id: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryItem[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === category.id
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {category.name} ({category.count})
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter; 