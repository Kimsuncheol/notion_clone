import React from 'react'
import LikedReadGrid from '@/components/LikedReadGrid'
import LikedReadTabbar from '@/components/LikedReadTabbar'

interface ReadPageProps {
  params: {
    userId: string;
    tab: string;
  }
}

export default function ReadPage({params}: ReadPageProps) {
  const { userId, tab } = params;
  console.log(userId, tab);
  const userEmail = userId.replace('%40', '@');
  const currentPath = `/${userEmail}/lists/read`;
  
  return (
    <div className='w-full'>
      <LikedReadTabbar userEmail={userEmail} currentPath={currentPath} />
      <LikedReadGrid items={[]} type="read" />
    </div>
  )
}
