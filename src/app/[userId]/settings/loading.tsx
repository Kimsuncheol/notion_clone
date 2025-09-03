import React from 'react';

const SettingsContentSkeleton = () => (
  <div className="px-2 py-6 animate-pulse">
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
  return <SettingsContentSkeleton />;
}