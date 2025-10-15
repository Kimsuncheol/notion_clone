import MarkdownEditorViewForAbout from '@/components/MarkdownEditorViewForAbout';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserProfile } from '@/services/my-post/firebase';
import { CustomUserProfile } from '@/types/firebase';
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail';
import React from 'react'

export default async function AboutPage({ params }: { params: Promise<{ userId: string}>;}) {
  const { userId } = await params;
  const userEmail = convertToNormalUserEmail(userId);

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
