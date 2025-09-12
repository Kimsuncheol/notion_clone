import MyPosts from '@/components/my-posts/MyPosts';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserInfo } from '@/services/lists/liked/firebase';
import { fetchUserPosts, fetchUserProfile, fetchUserTags } from '@/services/my-post/firebase';
import { CustomUserProfile, MyPost, TagType } from '@/types/firebase';
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail';
import React from 'react'

interface MyPostPageProps {
  params: {
    userId: string;
  };
  searchParams: {
    tagName?: string;
    tagId?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export default async function MyPostPage({ params, searchParams }: MyPostPageProps) {
  const { userId } = await params;
  const tagName = searchParams.tagName;
  const tagId = searchParams.tagId;
  const createdAt = searchParams.createdAt;
  const updatedAt = searchParams.updatedAt;
  const userEmail = convertToNormalUserEmail(userId);
  const { id: actualUserId } = await fetchUserInfo(userEmail);
  const tag: TagType | undefined = (tagName && tagId) ? {
    id: tagId,
    userId: [actualUserId], // fetch existing other users' id in the tag
    name: tagName,
    createdAt: createdAt ? new Date(createdAt) : undefined,
    updatedAt: updatedAt ? new Date(updatedAt) : undefined
  } : undefined;

  // Fetch user posts and tags server-side in parallel
  const [userPosts, userTags, userProfile ]: [MyPost[], TagType[], CustomUserProfile | null] = await Promise.all([
    fetchUserPosts(userEmail, tag),
    fetchUserTags(userEmail),
    fetchUserProfile(userEmail),
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
      <MyPosts userId={actualUserId} userEmail={userEmail} posts={postsData} tags={userTags} currentTag={tag?.name || 'All'} />
    </div>
  )
}
