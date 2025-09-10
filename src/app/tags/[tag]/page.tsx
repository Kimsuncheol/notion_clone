import React from 'react';
import { notFound } from 'next/navigation';
import { fetchNotesByTag } from '@/services/tags/firebase';
import TrendingCard from '@/components/trending/TrendingCard';

interface TagPageProps {
  params: {
    tag: string;
  };
}


export default async function TagPage({ params }: TagPageProps) {
  const { tag } = params;
  const decodedTagName = decodeURIComponent(tag);
  console.log('decodedTagName: ', decodedTagName);

  try {
    const notes = await fetchNotesByTag(decodedTagName, false); // Only fetch public notes
    console.log('notes: ', notes);
    
    if (!notes || notes.length === 0) {
      notFound();
    }

    // Extract unique authors count
    const uniqueAuthors = new Set(notes.map(note => note.authorId)).size;
    const postCount = notes.length;
    
    // Get creation date from the oldest note
    const oldestNote = notes.reduce((oldest, note) => {
      const noteDate = note.createdAt instanceof Date ? note.createdAt : new Date(note.createdAt);
      const oldestDate = oldest.createdAt instanceof Date ? oldest.createdAt : new Date(oldest.createdAt);
      return noteDate < oldestDate ? note : oldest;
    });

    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tag Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              #{decodedTagName}
            </h1>
            <div className="flex justify-start items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                {uniqueAuthors} {uniqueAuthors === 1 ? 'Author' : 'Authors'}
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                {postCount} {postCount === 1 ? 'Post' : 'Posts'}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                First used {(oldestNote.createdAt instanceof Date ? oldestNote.createdAt : new Date(oldestNote.createdAt)).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Posts ({postCount})
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              All posts tagged with #{decodedTagName}
            </p>
          </div>

          {/* Notes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {notes.map((note) => (
              <TrendingCard
                key={note.id}
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

          {/* Empty State */}
          {notes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 dark:text-gray-600 text-lg mb-2">
                No posts found for this tag
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Check back later or try exploring other tags.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading tag page:', error);
    notFound();
  }
}

