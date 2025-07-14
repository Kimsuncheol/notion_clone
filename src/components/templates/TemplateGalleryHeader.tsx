"use client";

import React from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface TemplateGalleryHeaderProps {
  onBack: () => void;
}

const TemplateGalleryHeader: React.FC<TemplateGalleryHeaderProps> = ({ onBack }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex items-center justify-between">
          <div>
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