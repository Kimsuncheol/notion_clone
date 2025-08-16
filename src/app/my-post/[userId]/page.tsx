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
    <div className='md:w-[500px] lg:w-[600px] xl:w-[700px] h-full mx-auto flex flex-col gap-10'>
      <SelfIntroduction />
      <MyPostTabbar />
      {tab === 'posts' && <MyPosts />}
      {tab === 'series' && <MyPostSeries />}
    </div>
  )
}
