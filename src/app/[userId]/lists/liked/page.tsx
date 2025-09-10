import React from 'react'
import LikedReadGrid from '@/components/LikedReadGrid'
import LikedReadTabbar from '@/components/LikedReadTabbar'
import { fetchLikedPosts, fetchUserId } from '@/services/lists/liked/firebase'
import type { LikeUser } from '@/types/firebase'

interface LikedPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default async function LikedPage({params}: LikedPageProps) {
  const { userId, tab } = params;
  console.log(userId, tab);
  const userEmail = userId.replace('%40', '@');
  const currentPath = `/${userEmail}/lists/liked`;

  const actualUserId = await fetchUserId(userEmail);

  const likedUser: LikeUser = {
    id: actualUserId,
    uid: actualUserId,
    email: userEmail,
    displayName: userEmail.split('@')[0],
    joinedAt: new Date()
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
