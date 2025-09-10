import React from 'react'
import LikedReadGrid from '@/components/LikedReadGrid'
import LikedReadTabbar from '@/components/LikedReadTabbar'
import { fetchRecentReadPosts } from '@/services/lists/read/firebase'

interface ReadPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function ReadPage({params}: ReadPageProps) {
  const { userId, tab } = params;
  console.log(userId, tab);
  const userEmail = userId.replace('%40', '@');
  const currentPath = `/${userEmail}/lists/read`;

  const recentReadNotes = await fetchRecentReadPosts(userEmail);
  
  return (
    <div className='w-full'>
      <LikedReadTabbar userEmail={userEmail} currentPath={currentPath} />
      <LikedReadGrid items={recentReadNotes} type="read" />
    </div>
  )
}
