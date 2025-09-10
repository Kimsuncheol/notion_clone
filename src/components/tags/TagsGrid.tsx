import React from 'react'
import TagsCard from './TagsCard';
import { TagTypeForTagsCollection } from '@/types/firebase';

interface TagsGridProps {
  tags: TagTypeForTagsCollection[];
}

export default function TagsGrid({ tags }: TagsGridProps) {
  // If no tags are provided, show empty state
  if (!tags || tags.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-2">No tags found</p>
          <p className="text-gray-500 text-sm">Tags will appear here when posts are published with tags.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
      {tags.map((tag) => (
        <TagsCard
          key={tag.id}
          tag={tag.name}
          postCount={tag.postCount}
          isHighlighted={tag.postCount > 10} // Highlight tags with more than 10 posts
        />
      ))}
    </div>
  );
}
