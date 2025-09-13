import React from 'react'
import { FirebaseNoteContent } from '@/types/firebase'
import TrendingCard from './trending/TrendingCard'

interface LikedReadGridProps {
  items: FirebaseNoteContent[]
  type: 'liked' | 'read'
}

export default function LikedReadGrid({ items = [], type }: LikedReadGridProps) {
  return (
    <div className="px-2 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <TrendingCard
            key={item.id}
            id={item.id}
            authorEmail={item.authorEmail || ''}
            authorName={item.authorName || 'Anonymous'}
            authorAvatar={item.authorAvatar || ''}
            createdAt={item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt || '')}
            updatedAt={item.updatedAt instanceof Date ? item.updatedAt : new Date(item.updatedAt || '')}
            likeCount={item.likeCount || 0}
            commentCount={item.comments?.length || 0}
            title={item.title || 'Untitled'}
            description={item.description || ''}
            imageUrl={item.thumbnailUrl || undefined}
          />
        ))}
      </div>
    </div>
  )
}

LikedReadGrid.displayName = 'LikedReadGrid'