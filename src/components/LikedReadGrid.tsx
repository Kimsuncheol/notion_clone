import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LikedReadItem } from '@/types/firebase'
import { mockLikedReadItems } from '@/constants/mockDatalist'

interface LikedReadGridProps {
  items: LikedReadItem[]
  type: 'liked' | 'read'
}


export default function LikedReadGrid({ items = mockLikedReadItems, type }: LikedReadGridProps) {
  return (
    <div className="px-2 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <LikedReadGridItem key={item.id} item={item} type={type} />
        ))}
      </div>
    </div>
  )
}

interface LikedReadGridItemProps {
  item: LikedReadItem
  type: 'liked' | 'read'
}

function LikedReadGridItem({ item }: LikedReadGridItemProps) {
  return (
    <Link
      href={`/note/${item.id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden border dark:border-gray-700"
    >
      <div className="aspect-video relative bg-gray-100 dark:bg-gray-700">
        <Image
          src={item.thumbnail}
          alt={item.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 text-sm">
          {item.title}
        </h3>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3 mb-3 leading-relaxed">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
              {item.authorAvatar ? (
                <Image
                  src={item.authorAvatar}
                  alt={item.authorName}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.authorName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {item.authorName}
            </span>
          </div>
          
          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{item.viewCount}</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{item.likeCount}</span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

LikedReadGrid.displayName = 'LikedReadGrid'
LikedReadGridItem.displayName = 'LikedReadGridItem'