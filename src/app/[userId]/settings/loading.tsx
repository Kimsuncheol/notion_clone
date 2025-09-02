import React from 'react';
import { grayColor2 } from '@/constants/color';

const HeaderSkeleton = () => (
  <div className="flex justify-between items-center px-2 py-3 animate-pulse">
    <div className="h-8 bg-gray-600 rounded w-48" />
    <div className="flex items-center gap-4">
      <div className="w-6 h-6 bg-gray-600 rounded" />
      <div className="w-6 h-6 bg-gray-600 rounded" />
      <div className="w-20 h-8 bg-gray-600 rounded-full" />
      <div className="w-10 h-10 bg-gray-600 rounded-full" />
    </div>
  </div>
);

const SettingsContentSkeleton = () => (
  <div className="px-8 py-6 animate-pulse">
    {/* Settings title */}
    <div className="h-8 bg-gray-600 rounded w-48 mb-8" />
    
    {/* Settings sections */}
    <div className="space-y-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-[#262626] rounded-lg p-6">
          {/* Section title */}
          <div className="h-6 bg-gray-600 rounded w-32 mb-4" />
          
          {/* Section content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-600 rounded w-40" />
              <div className="w-12 h-6 bg-gray-600 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-600 rounded w-36" />
              <div className="w-20 h-8 bg-gray-600 rounded" />
            </div>
            {index === 3 && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-600">
                <div className="h-4 bg-red-600 rounded w-32" />
                <div className="w-24 h-8 bg-red-600 rounded" />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function SettingsLoading() {
  return (
    <div className='w-full min-h-screen relative' style={{ backgroundColor: grayColor2 }}>
      <div className='w-[80%] mx-auto min-h-screen'>
        <HeaderSkeleton />
        <SettingsContentSkeleton />
      </div>
    </div>
  );
}