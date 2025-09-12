import React from 'react'
import LikedReadGrid from '@/components/LikedReadGrid'
import LikedReadTabbar from '@/components/LikedReadTabbar'
import { fetchLikedPosts, fetchUserInfo } from '@/services/lists/liked/firebase'
import type { LikeUser } from '@/types/firebase'
import { convertToNormalUserEmail } from '@/utils/convertTonormalUserEmail'

interface LikedPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function LikedPage({params}: LikedPageProps) {
  const { userId, tab } = params;
  console.log(userId, tab);
  const userEmail = convertToNormalUserEmail(userId);
  const currentPath = `/${userEmail}/lists/liked`;

  const {id: actualUserId, joinedAt, displayName} = await fetchUserInfo(userEmail);

  const likedUser: LikeUser = {
    id: actualUserId,
    uid: actualUserId,
    email: userEmail,
    displayName,
    joinedAt
  };

  const likedNotes = await fetchLikedPosts(likedUser);

  console.log('likedNotes: ', likedNotes);

  return (
    <div className='w-full'>
      <LikedReadTabbar userEmail={userEmail || ''} currentPath={currentPath} />
      <LikedReadGrid items={likedNotes} type="liked" />
    </div>
  )
}
