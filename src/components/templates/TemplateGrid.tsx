"use client";

import React from 'react';
import TemplateCard from './TemplateCard';
import { Template } from '@/types/templates';

interface TemplateGridProps {
  templates: Template[];
  onTemplateSelect: (template: Template) => void;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, onTemplateSelect }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onSelect={onTemplateSelect}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            No templates found in this category.
          </div>
        </div>
      )}
    </>
  );
};

export default TemplateGrid; 