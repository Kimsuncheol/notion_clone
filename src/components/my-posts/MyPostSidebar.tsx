'use client';

import React, { useState } from 'react'

export default function MyPostSidebar() {
  const [selectedTag, setSelectedTag] = useState('All')

  const tags = [
    { name: 'All', count: 62 }
    // Add more tags here as needed
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
          {tags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(tag.name)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-between group ${
                selectedTag === tag.name
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
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
