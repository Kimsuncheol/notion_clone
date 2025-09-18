import React from 'react';
import 'katex/dist/katex.min.css';
import TrendingTabbar from '@/components/trending/TrendingTabbar';
import TrendingGrid from '@/components/trending/TrendingGrid';
import TrendingHeader from '@/components/trending/TrendingHeader';
import { grayColor2 } from '@/constants/color';
import { TrendingItem } from '@/types/firebase';
import { fetchTrendingItems } from '@/services/trending/firebase';

export default async function Home() {
  // Fetch trending data server-side with default timeframe 'week'
  let items: TrendingItem[] = [];
  
  try {
    items = await fetchTrendingItems('week', 20);
  } catch (error) {
    console.error('Error fetching trending items:', error);
    items = [];
  }

  return (
    <div className="w-[80%] min-h-screen px-2 mx-auto" style={{ backgroundColor: grayColor2 }}>
      <div className="px-2">
        <TrendingTabbar />
        <TrendingGrid items={items} />
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: 'Notion Clone - Trending Content',
    description: 'Discover trending notes and content in our Notion-like platform',
    keywords: 'trending, notes, content, notion clone, popular',
  };
}
