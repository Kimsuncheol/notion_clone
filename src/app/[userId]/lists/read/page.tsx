import React from 'react'
import LikedReadGrid from '@/components/LikedReadGrid'
import LikedReadTabbar from '@/components/LikedReadTabbar'
import { fetchRecentReadPosts } from '@/services/lists/read/firebase'
import { fetchUserInfo } from '@/services/lists/liked/firebase'
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail'

interface ReadPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function ReadPage({params}: ReadPageProps) {
  const { userId, tab } = params;
  console.log(userId, tab);
  const userEmail = convertToNormalUserEmail(userId);
  const currentPath = `/${userEmail}/lists/read`;

  const { id: actualUserId } = await fetchUserInfo(userEmail);
  const recentReadNotes = await fetchRecentReadPosts(actualUserId);
  
  return (
    <div className='w-full'>
      <LikedReadTabbar userEmail={userEmail} currentPath={currentPath} />
      <LikedReadGrid items={recentReadNotes} type="read" />
    </div>
  )
}
