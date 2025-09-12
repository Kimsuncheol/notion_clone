import MyPostSeries from '@/components/my-posts/MyPostSeries';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserProfile } from '@/services/my-post/firebase';
import { fetchUserSeriesTitle } from '@/services/series/firebase';
import { CustomUserProfile, MySeries } from '@/types/firebase';
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail';
import React from 'react'

interface SeriesPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { userId } = await params;
  const userEmail = convertToNormalUserEmail(userId);

  const [userSeries, userProfile]: [MySeries[], CustomUserProfile | null] = await Promise.all([
    fetchUserSeriesTitle(userEmail),
    fetchUserProfile(userEmail)
  ]);

  return (
    <div className='w-full h-full mx-auto flex flex-col items-end justify-center gap-10'>
      <div className='w-[75%]'>
        <SelfIntroduction userProfile={userProfile} />
        <MyPostTabbar currentTab={'series'} />
      </div>
      <MyPostSeries series={userSeries} userId={userId} />
    </div>
  )
}
