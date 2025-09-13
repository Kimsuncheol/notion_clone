import React from 'react';
import TrendingGrid from '@/components/trending/TrendingGrid';
import TrendingTabbar from '@/components/trending/TrendingTabbar';
import { MyPost, TrendingItem } from '@/types/firebase';
import { fetchRecentPosts } from '@/services/recent/firebase';

// Server Component with async data fetching (App Router)
export default async function RecentPage() {
  // Fetch data server-side
  let recentPosts: MyPost[] = [];
  
  try {
    recentPosts = await fetchRecentPosts(15);
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    recentPosts = [];
  }

  // Convert MyPost[] to TrendingItem[] for TrendingGrid compatibility
  const trendingItems: TrendingItem[] = recentPosts.map(post => ({
    id: post.id,
    title: post.title,
    description: post.description || '',
    content: post.content,
    imageUrl: post.thumbnailUrl || undefined,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt, // Use createdAt since MyPost doesn't have updatedAt
    authorId: post.authorId,
    authorName: post.authorName,
    authorEmail: post.authorEmail,
    authorAvatar: post.authorAvatar,
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
    title: 'Recent Posts - Notion Clone',
    description: 'Discover recently updated posts and content',
    keywords: 'recent, posts, updates, latest, content',
  };
}
