import MyPosts from '@/components/dashboard/MyPosts';
import MyPostSeries from '@/components/my-posts/MyPostSeries';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserPosts, fetchUserSeries } from '@/services/my-post/firebase';
import { MyPost } from '@/types/firebase';
import React from 'react'

interface MyPostPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function MyPostPage({ params }: MyPostPageProps) {
  const { userId, tab } = await params;
  const userEmail = userId.replace('%40', '@');
  
  // Fetch user posts server-side
  const userPosts: MyPost[] = await fetchUserPosts(userEmail);
  
  // Filter posts into series (posts with subNotes) and regular posts
  const postsData = userPosts;
  // const postsData = userPosts.filter(post => post.subNotes.length === 0);
  const seriesData = await fetchUserSeries(userEmail);

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
