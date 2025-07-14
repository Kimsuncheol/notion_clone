"use client";

import React from 'react';
import TemplateGalleryHeader from './TemplateGalleryHeader';
import CategoryFilter from './CategoryFilter';
import TemplateGrid from './TemplateGrid';
import { Template } from '@/types/templates';

interface CategoryItem {
  id: string;
  name: string;
  count: number;
}

interface TemplateGalleryViewProps {
  categories: CategoryItem[];
  selectedCategory: string;
  filteredTemplates: Template[];
  onBack: () => void;
  onCategorySelect: (categoryId: string) => void;
  onTemplateSelect: (template: Template) => void;
}

const TemplateGalleryView: React.FC<TemplateGalleryViewProps> = ({
  categories,
  selectedCategory,
  filteredTemplates,
  onBack,
  onCategorySelect,
  onTemplateSelect,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TemplateGalleryHeader onBack={onBack} />

      <div className="max-w-7xl mx-auto p-4">
        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={onCategorySelect}
          />
        </div>

        {/* Templates Grid */}
        <TemplateGrid
          templates={filteredTemplates}
          onTemplateSelect={onTemplateSelect}
        />
      </div>
    </div>
  );
};

export default TemplateGalleryView; 