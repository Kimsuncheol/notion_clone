import React from 'react';
import TrendingTabbar from '@/components/trending/TrendingTabbar';
import TrendingGrid from '@/components/trending/TrendingGrid';
import { grayColor2 } from '@/constants/color';
import TrendingHeader from '@/components/trending/TrendingHeader';
import { TrendingItem } from '@/types/firebase';
import { fetchTrendingItems } from '@/services/trending/firebase';

interface PageProps {
  params: {
    timeframe: string;
  };
}

// Server Component with async data fetching (App Router)
export default async function TrendingPage({ params }: PageProps) {
  const { timeframe } = await params;
  
  // Fetch data server-side in the component
  let items: TrendingItem[] = [];
  
  try {
    items = await fetchTrendingItems(timeframe, 20);
  } catch (error) {
    console.error('Error fetching trending items:', error);
    items = [];
  }

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: grayColor2 }}>
      <TrendingHeader />
      <TrendingTabbar />
      <TrendingGrid items={items} />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const { timeframe } = await params;
  
  return {
    title: `Trending ${timeframe} - Notion Clone`,
    description: `Discover trending content for ${timeframe} period`,
    keywords: `trending, ${timeframe}, popular, content`,
  };
}
