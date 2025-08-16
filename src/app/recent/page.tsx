"use client";

import React from 'react';
import TrendingHeader from '@/components/trending/TrendingHeader';
import TrendingGrid from '@/components/trending/TrendingGrid';
import TrendingTabbar from '@/components/trending/TrendingTabbar';

// Mock data for recent layout demonstration
const mockRecentItems = Array.from({ length: 15 }, (_, i) => ({
  id: `recent-${i}`,
  title: `Recent Item ${i + 1}`,
  content: `Recent content for item ${i + 1}. This shows how the layout adapts to different amounts of content for the recent page.`,
  imageUrl: i % 4 === 0 ? `https://picsum.photos/400/300?random=${i + 100}` : undefined,
}));

export default function RecentPage() {
  const handleCardClick = (id: string) => {
    console.log('Recent card clicked:', id);
    // TODO: Implement navigation to item detail
  };

  return (
    <div className="w-full">
      <TrendingHeader />
      <TrendingTabbar />
      <TrendingGrid items={mockRecentItems} onCardClick={handleCardClick} />
    </div>
  );
}
