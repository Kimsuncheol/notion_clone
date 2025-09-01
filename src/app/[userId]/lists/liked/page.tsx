import React from 'react'
import LikedReadGrid from '@/components/LikedReadGrid'
import LikedReadTabbar from '@/components/LikedReadTabbar'

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

  return (
    <div className='w-full'>
      <LikedReadTabbar userEmail={userEmail || ''} currentPath={currentPath} />
      < LikedReadGrid items={[]} type="liked" />
    </div>
  )
}
