import MyPosts from '@/components/dashboard/MyPosts';
import MyPostSeries from '@/components/my-posts/MyPostSeries';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserPosts } from '@/services/my-post/firebase';
import { MyPost, MyPostSeries as MyPostSeriesType } from '@/types/firebase';
import React from 'react'

interface MyPostPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function MyPostPage({ params }: MyPostPageProps) {
  const { userId, tab } = await params;
  
  // Fetch user posts server-side
  const userPosts: MyPost[] = await fetchUserPosts(userId);
  
  // Filter posts into series (posts with subNotes) and regular posts
  const postsData = userPosts.filter(post => post.subNotes.length === 0);
  const seriesData: MyPostSeriesType[] = userPosts
    .filter(post => post.subNotes.length > 0)
    .map(post => ({
      id: post.id,
      title: post.title,
      thumbnail: post.thumbnail || '',
      content: post.content,
      userId: post.userId,
      authorEmail: post.authorEmail,
      authorName: post.authorName,
      isTrashed: post.isTrashed || false,
      trashedAt: post.trashedAt || new Date(),
      viewCount: post.viewCount,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      comments: post.comments || [],
      createdAt: post.createdAt,
      updatedAt: post.createdAt, // MyPost doesn't have updatedAt, use createdAt instead
      subNotes: post.subNotes
    }));

  return (
    <div className='w-full h-full mx-auto flex flex-col items-end justify-center gap-10'>
      <div className='w-[75%]'>
        <SelfIntroduction />
        <MyPostTabbar currentTab={tab} />
      </div>
      {tab === 'posts' && <MyPosts posts={postsData} />}
      {tab === 'series' && <MyPostSeries series={seriesData} />}
    </div>
  )
}
