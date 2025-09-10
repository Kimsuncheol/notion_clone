import React from 'react';
import { FirebaseNoteContent } from '@/types/firebase';
import TrendingCard from '../trending/TrendingCard';

interface TagGridProps {
  notes: FirebaseNoteContent[];
  className?: string;
}

export const TagGrid: React.FC<TagGridProps> = ({ notes, className = "" }) => {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 dark:text-gray-600 text-lg mb-2">
          No posts found for this tag
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Check back later or try exploring other tags.
        </p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Posts ({notes.length})
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Discover posts with this tag
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {notes.map((note, index) => (
          <TrendingCard
            key={note.id || `note-${index}`}
            id={note.id}
            authorEmail={note.authorEmail || ''}
            authorName={note.authorName || 'Anonymous'}
            createdAt={note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt || '')}
            updatedAt={note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt || '')}
            likeCount={note.likeCount || 0}
            commentCount={note.comments?.length || 0}
            title={note.title || 'Untitled'}
            description={note.description || ''}
            imageUrl={note.thumbnailUrl || undefined}
          />
        ))}
      </div>
      
      {notes.length > 12 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {Math.min(12, notes.length)} of {notes.length} posts
          </p>
        </div>
      )}
    </div>
  );
};
