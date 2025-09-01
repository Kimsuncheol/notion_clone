import React from 'react';
import MyPostsSkeleton from './MyPostsSkeleton';
import MyPostSeriesSkeleton from './MyPostSeriesSkeleton';

interface MyPostContentSkeletonProps {
  tab?: 'posts' | 'series';
}

export default function MyPostContentSkeleton({ tab = 'posts' }: MyPostContentSkeletonProps) {
  return (
    <>
      {tab === 'posts' && <MyPostsSkeleton />}
      {tab === 'series' && <MyPostSeriesSkeleton />}
    </>
  );
}
