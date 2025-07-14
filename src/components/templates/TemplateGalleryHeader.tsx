"use client";

import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TemplateGalleryHeaderProps {
  onBack: () => void;
}

const TemplateGalleryHeader: React.FC<TemplateGalleryHeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowBackIcon fontSize="small" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Note Templates
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Choose from our collection of professionally designed templates to get started quickly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGalleryHeader; 