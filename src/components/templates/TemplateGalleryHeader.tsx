"use client";

import { grayColor2 } from '@/constants/color';
import React from 'react';

interface TemplateGalleryHeaderProps {
  onBack: () => void;
}

const TemplateGalleryHeader: React.FC<TemplateGalleryHeaderProps> = () => {
  return (
    <div className="border-b border-gray-200 dark:border-black/50 px-4 py-2" style={{ backgroundColor: grayColor2 }}>
      <div className="w-[80%] mx-auto p-4">
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