import MarkdownEditorViewForAbout from '@/components/MarkdownEditorViewForAbout';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserProfile } from '@/services/my-post/firebase';
import { CustomUserProfile } from '@/types/firebase';
import React from 'react'

interface AboutPageProps {
  params: {
    userId: string;
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { userId } = await params;
  const userEmail = userId.replace('%40', '@');

  // Fetch user posts and tags server-side in parallel
  const [ userProfile]: [CustomUserProfile | null] = await Promise.all([
    fetchUserProfile(userEmail)
  ]);

  return (
    <div className='w-[75%] mx-auto h-full flex flex-col justify-center gap-10'>
      <div className='w-full'>
        <SelfIntroduction userProfile={userProfile} />
        <MyPostTabbar currentTab={'about'} />
      </div>
      <div className='w-full'>
        <MarkdownEditorViewForAbout />
      </div>
    </div>
  )
}
