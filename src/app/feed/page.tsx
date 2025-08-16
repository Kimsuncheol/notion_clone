"use client";

import React from 'react';
import TrendingHeader from '@/components/trending/TrendingHeader';
import TrendingGrid from '@/components/trending/TrendingGrid';
import TrendingTabbar from '@/components/trending/TrendingTabbar';

// Mock data for feed layout demonstration
const mockFeedItems = Array.from({ length: 12 }, (_, i) => ({
  id: `feed-${i}`,
  title: `Feed Item ${i + 1}`,
  content: `Feed content for item ${i + 1}. This demonstrates the responsive grid layout for the feed page.`,
  imageUrl: i % 2 === 0 ? `https://picsum.photos/400/300?random=${i + 200}` : undefined,
}));

export default function FeedPage() {
  const handleCardClick = (id: string) => {
    console.log('Feed card clicked:', id);
    // TODO: Implement navigation to item detail
  };

  return (
    <div className="w-full">
      <TrendingHeader />
      <TrendingTabbar />
      <TrendingGrid items={mockFeedItems} onCardClick={handleCardClick} />
    </div>
  );
}
