"use client";

import React from 'react';
import { useParams } from 'next/navigation';
import TrendingTabbar from '@/components/trending/TrendingTabbar';
import TrendingGrid from '@/components/trending/TrendingGrid';
import { trendingPageBgColor } from '@/constants/color';
import TrendingHeader from '@/components/trending/TrendingHeader';

// Mock data for layout demonstration
const mockTrendingItems = Array.from({ length: 20 }, (_, i) => ({
  id: `item-${i}`,
  title: `Trending Item ${i + 1}`,
  content: `This is the content for trending item ${i + 1}. It contains some sample text to demonstrate how the card layout works with different content lengths.`,
  imageUrl: i % 3 === 0 ? `https://picsum.photos/400/300?random=${i}` : undefined,
}));

const mockRecentItems = Array.from({ length: 15 }, (_, i) => ({
  id: `recent-${i}`,
  title: `Recent Item ${i + 1}`,
  content: `Recent content for item ${i + 1}. This shows how the layout adapts to different amounts of content.`,
  imageUrl: i % 4 === 0 ? `https://picsum.photos/400/300?random=${i + 100}` : undefined,
}));

const mockFeedItems = Array.from({ length: 12 }, (_, i) => ({
  id: `feed-${i}`,
  title: `Feed Item ${i + 1}`,
  content: `Feed content for item ${i + 1}. This demonstrates the responsive grid layout.`,
  imageUrl: i % 2 === 0 ? `https://picsum.photos/400/300?random=${i + 200}` : undefined,
}));

export default function TrendingPage() {
  const params = useParams();
  const period = params.period as string;

  const handleCardClick = (id: string) => {
    console.log('Card clicked:', id);
    // TODO: Implement navigation to item detail
  };

  const getItemsForPeriod = () => {
    switch (period) {
      case 'recent':
        return mockRecentItems;
      case 'feed':
        return mockFeedItems;
      case 'weekly':
      default:
        return mockTrendingItems;
    }
  };

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: trendingPageBgColor }}>
      <TrendingHeader />
      <TrendingTabbar />
      <TrendingGrid items={mockTrendingItems} onCardClick={handleCardClick} />
    </div>
  );
}
