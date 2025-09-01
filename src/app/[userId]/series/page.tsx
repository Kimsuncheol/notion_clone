import MyPostSeries from '@/components/my-posts/MyPostSeries';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { fetchUserSeriesTitle } from '@/services/series/firebase';
import React from 'react'

interface SeriesPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function SeriesPage({ params }: SeriesPageProps) {
  const { userId } = await params;
  const userEmail = userId.replace('%40', '@');
  // const postsData = userPosts.filter(post => post.subNotes.length === 0);
  const seriesData = await fetchUserSeriesTitle(userEmail);
  console.log('seriesData: ', seriesData);
  // const seriesData = await fetchUserSeriesContents(userEmail);

  return (
    <div className='w-full h-full mx-auto flex flex-col items-end justify-center gap-10'>
      <div className='w-[75%]'>
        <SelfIntroduction />
        <MyPostTabbar currentTab={'series'} />
      </div>
      <MyPostSeries series={seriesData} userId={userId} />
    </div>
  )
}
