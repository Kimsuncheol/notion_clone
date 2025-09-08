'use client';

import { TagType } from '@/types/firebase';
import Link from 'next/link';
import React from 'react'

interface MyPostSidebarProps {
  userEmail: string;
  currentTag: string;
  tags?: TagType[];
}

export default function MyPostSidebar({userEmail, tags = [], currentTag = 'All'}: MyPostSidebarProps) {
  const tagList: (TagType & { count: number })[] = [
    { id: 'all', name: 'All', count: tags.length },
    ...tags.map(tag => ({ id: tag.id, name: tag.name, createdAt: tag.createdAt, updatedAt: tag.updatedAt, count: 1 })) // You might want to add count logic
  ]

  return (
    <div className='w-full h-full text-white sticky top-0'>
      <div className=''>
        {/* Header */}
        <div className='mb-4'>
          <h2 className='text-xl font-semibold text-gray-200 border-b border-gray-700 pb-4'>
            Tags
          </h2>
        </div>

        {/* Tag List */}
        <div className='space-y-2'>
          {tagList.map((tag) => (
            <Link
              key={tag.name}
              href={{
                pathname: `/${userEmail}/posts/${tag.name.toLowerCase()}`,
                query: { 
                  tagName: tag.name.toLowerCase(),
                  tagId: tag.id,
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
      </div>
    </div>
  )
}
