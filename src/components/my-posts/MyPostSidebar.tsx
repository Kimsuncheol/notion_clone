'use client';

import { getMyPostsCountByTag, getMyTotalPostsCount } from '@/services/my-post/firebase';
import { TagType } from '@/types/firebase';
import Link from 'next/link';
import React, { useState, useEffect } from 'react'

interface MyPostSidebarProps {
  userId: string;
  userEmail: string;
  currentTag: string;
  tags?: TagType[];
}

export default function MyPostSidebar({userId, userEmail, tags = [], currentTag = 'All'}: MyPostSidebarProps) {
  const [tagList, setTagList] = useState<(TagType & { count: number })[]>([]);
  const [showAllTags, setShowAllTags] = useState(false);

  useEffect(() => {
    const loadCounts = async () => {
      tags.forEach(tag => console.log('tag in MyPostSidebar: ', tag));
      const totalCount = await getMyTotalPostsCount(userId);
      const tagCounts = await Promise.all(
        tags.map(async (tag) => {
          const count = await getMyPostsCountByTag(userId, tag);
          console.log('count in MyPostSidebar: ', count);
          return { id: tag.id, name: tag.name, createdAt: tag.createdAt, updatedAt: tag.updatedAt, count };
        })
      );
      
      setTagList([
        { id: 'all', name: 'All', count: totalCount },
        ...tagCounts
      ]);
    };

    loadCounts();
    return () => {
      setTagList([]);
    }
  }, [userId, tags]);

  useEffect(() => {
    setShowAllTags(false);
  }, [tags]);

  const visibleTags = showAllTags ? tagList : tagList.slice(0, 5);
  const hasMoreTags = tagList.length > 5;

  const tagListClassName = showAllTags
    ? 'space-y-2 max-h-[280px] overflow-y-auto pr-1'
    : 'space-y-2';

  return (
    <div className='w-full text-white h-fit'>
      <div className=''>
        {/* Header */}
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-200 border-b border-gray-700 pb-4'>
            Tags
          </h2>
        </div>

        {/* Tag List */}
        <div className={tagListClassName}>
          {visibleTags.map((tag) => (
            <Link
              key={tag.name}
              href={{
                pathname: `/${userEmail}/posts/${tag.name.toLowerCase()}`,
                query: { 
                  tagName: tag.name.toLowerCase(),
                  tagId: tag.id,
                  // userId: userId,
                  // local timezone
                  createdAt: tag.createdAt?.toLocaleString(),
                  updatedAt: tag.updatedAt?.toLocaleString()
                }
              }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between group cursor-pointer ${
                currentTag === tag.name || (tag.name === 'All' && currentTag === 'all') // Don't change this
                  ? ' text-green-600'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <span className={`text-base`}>
                {tag.name}
              </span>
              <span className={`text-sm`}>
                ({tag.count})
              </span>
            </Link>
          ))}
        </div>
        {hasMoreTags && !showAllTags && (
          <button
            type="button"
            className='mt-4 w-full rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:border-gray-400 hover:text-white'
            onClick={() => setShowAllTags(true)}
          >
            More
          </button>
        )}
      </div>
    </div>
  )
}
