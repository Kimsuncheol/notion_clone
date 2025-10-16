import React from 'react';
import TrendingGrid from '@/components/trending/TrendingGrid';
import TrendingTabbar from '@/components/trending/TrendingTabbar';
import { MyPost, TrendingItem } from '@/types/firebase';
import { fetchCuratedFeed } from '@/services/feed/firebase';

// Server Component with async data fetching (App Router)
export default async function FeedPage() {
  // Fetch data server-side
  let feedPosts: MyPost[] = [];
  
  try {
    feedPosts = await fetchCuratedFeed(12);
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    feedPosts = [];
  }

  // Convert MyPost[] to TrendingItem[] for TrendingGrid compatibility
  const trendingItems: TrendingItem[] = feedPosts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    imageUrl: post.thumbnailUrl || undefined,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt, // Use createdAt since MyPost doesn't have updatedAt
    authorId: post.authorId,
    description: post.description || '',  
    authorName: post.authorName,
    authorEmail: post.authorEmail,
    viewCount: post.viewCount,
    likeCount: post.likeCount,
    commentCount: post.comments?.length || 0,
  }));

  return (
    <div className="w-full">
      <TrendingTabbar />
      <TrendingGrid items={trendingItems} />
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata() {
  return {
    title: 'Feed - Notion Clone',
    description: 'Your personalized feed with popular and recent posts',
    keywords: 'feed, personalized, popular, posts, content, discover',
  };
}
