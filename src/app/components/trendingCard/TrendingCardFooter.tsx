'use client';

import Avatar from '@mui/material/Avatar';
import React from 'react';

interface TrendingCardFooterProps {
  authorAvatar?: string;
  authorName?: string;
  likeCount: number;
  borderColor: string;
}

const TrendingCardFooter: React.FC<TrendingCardFooterProps> = ({
  authorAvatar,
  authorName,
  likeCount,
  borderColor,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-2" style={{ borderTop: `1px solid ${borderColor}` }}>
      <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <Avatar src={authorAvatar} alt={authorName} sx={{ width: 24, height: 24 }} />
        by {authorName}
      </span>
      <span className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span className="text-[16px]">&#10084;</span>
        <span>{likeCount}</span>
      </span>
    </div>
  );
};

export default TrendingCardFooter;
