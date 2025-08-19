// Redering the page with SSR
'use client';

import MyPosts from '@/components/dashboard/MyPosts';
import MyPostSeries from '@/components/my-posts/MyPostSeries';
import MyPostTabbar from '@/components/my-posts/MyPostTabbar'
import SelfIntroduction from '@/components/my-posts/SelfIntroduction'
import { useMyPostStore } from '@/store/myPostStore';
import React from 'react'

export default function MyPostPage() {
  const { tab } = useMyPostStore();

  return (
    <div className='w-full h-full mx-auto flex flex-col items-end justify-center gap-10'>
      <div className='w-[75%]'>
        <SelfIntroduction />
        <MyPostTabbar />
      </div>
      {tab === 'posts' && <MyPosts />}
      {tab === 'series' && <MyPostSeries />}
    </div>
  )
}
