import MyPosts from '@/components/dashboard/MyPosts';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserPosts } from '@/services/my-post/firebase';
import { MyPost } from '@/types/firebase';
import React from 'react'

interface MyPostPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function MyPostPage({ params }: MyPostPageProps) {
  const { userId } = await params;
  const userEmail = userId.replace('%40', '@');
  
  // Fetch user posts server-side
  const userPosts: MyPost[] = await fetchUserPosts(userEmail);
  
  // Filter posts into series (posts with subNotes) and regular posts
  const postsData = userPosts;

  return (
    <div className='w-full h-full mx-auto flex flex-col items-end justify-center gap-10'>
      <div className='w-[75%]'>
        <SelfIntroduction />
        <MyPostTabbar currentTab={'posts'} />
      </div>
      <MyPosts posts={postsData} />
    </div>
  )
}
