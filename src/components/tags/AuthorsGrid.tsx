import React, { useMemo, useState } from 'react';
import AuthorCard from './AuthorCard';
import { TagTypeForTagsCollection, CustomUserProfile } from '@/types/firebase';

interface AuthorsGridProps {
  tags: TagTypeForTagsCollection[];
}

type SortOption = 'name' | 'posts' | 'followers' | 'recent';

export default function AuthorsGrid({ tags }: AuthorsGridProps) {
  const [sortBy, setSortBy] = useState<SortOption>('posts');

  // Extract unique authors from all tags
  const uniqueAuthors = useMemo(() => {
    const authorsMap = new Map<string, CustomUserProfile>();
    
    tags.forEach(tag => {
      tag.authors.forEach(author => {
        if (author.id && !authorsMap.has(author.id)) {
          authorsMap.set(author.id, author);
        }
      });
    });
    
    const authors = Array.from(authorsMap.values());
    
    // Sort authors based on selected option
    return authors.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.displayName || '').localeCompare(b.displayName || '');
        case 'posts':
          return (b.postCount || 0) - (a.postCount || 0);
        case 'followers':
          return (b.followersCount || 0) - (a.followersCount || 0);
        case 'recent':
          return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
        default:
          return 0;
      }
    });
  }, [tags, sortBy]);

  if (!tags || tags.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No authors found</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">Authors will appear here when tags have associated authors.</p>
      </div>
    );
  }

  if (uniqueAuthors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">No authors available</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm">Authors information is not available for the current tags.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with sort options */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Authors ({uniqueAuthors.length})
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Discover authors who have contributed to these tags
          </p>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="posts">Most Posts</option>
            <option value="followers">Most Followers</option>
            <option value="name">Name (A-Z)</option>
            <option value="recent">Recently Joined</option>
          </select>
        </div>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {uniqueAuthors.map((author) => (
          <AuthorCard key={author.id} author={author} />
        ))}
      </div>

      {/* Footer Stats */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {uniqueAuthors.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Authors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {uniqueAuthors.reduce((sum, author) => sum + (author.postCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Posts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {uniqueAuthors.reduce((sum, author) => sum + (author.followersCount || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Followers</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(uniqueAuthors.reduce((sum, author) => sum + (author.postCount || 0), 0) / uniqueAuthors.length)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Posts/Author</div>
          </div>
        </div>
      </div>
    </div>
  );
}