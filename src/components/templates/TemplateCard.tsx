"use client";

import React from 'react';
import { Template } from '@/types/templates';

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(template)}
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg dark:hover:shadow-gray-900/20 transition-all cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 group"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
          {template.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {template.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1 line-clamp-2">
            {template.description}
          </p>
          <div className="mt-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 capitalize">
              {template.category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCard; 