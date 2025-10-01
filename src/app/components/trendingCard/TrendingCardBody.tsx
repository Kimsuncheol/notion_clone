'use client';

import React from 'react';

interface TrendingCardBodyProps {
  title: string;
  description?: string;
  publishedLabel: string;
  commentCount: number;
  contentHeight: number;
}

const TrendingCardBody: React.FC<TrendingCardBodyProps> = ({
  title,
  description,
  publishedLabel,
  commentCount,
  contentHeight,
}) => {
  return (
    <div className="flex flex-col justify-between" style={{ height: contentHeight }}>
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-1 flex-col gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="h-20 overflow-y-hidden text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-sm text-gray-600 dark:text-gray-400">{publishedLabel}</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">&#8226;</span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{commentCount} comments</span>
        </div>
      </div>
    </div>
  );
};

export default TrendingCardBody;
