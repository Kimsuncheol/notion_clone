import MyPosts from '@/components/my-posts/MyPosts';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserPosts, fetchUserProfile, fetchUserTags } from '@/services/my-post/firebase';
import { CustomUserProfile, MyPost, TagType } from '@/types/firebase';
import React from 'react'

interface MyPostPageProps {
  params: {
    userId: string;
    tag: string;
  }
}

export default async function MyPostPage({ params }: MyPostPageProps) {
  const { userId, tag } = await params;
  const userEmail = userId.replace('%40', '@');
  
  // Fetch user posts and tags server-side in parallel
  const [userPosts, userTags, userProfile]: [MyPost[], TagType[], CustomUserProfile | null] = await Promise.all([
    fetchUserPosts(userEmail),
    fetchUserTags(userEmail),
    fetchUserProfile(userEmail)
  ]);
  console.log('userTags: ', userTags);
  
  // Filter posts into series (posts with subNotes) and regular posts
  const postsData = userPosts;

  return (
    <div className='w-full h-full mx-auto flex flex-col items-end justify-center gap-10'>
      <div className='w-[75%]'>
        <SelfIntroduction userProfile={userProfile} />
        <MyPostTabbar currentTab={'posts'} />
      </div>
      <MyPosts userEmail={userEmail} posts={postsData} tags={userTags} currentTag={tag} />
    </div>
  )
}
