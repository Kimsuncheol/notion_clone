"use client";
import TagsGrid from '@/components/tags/TagsGrid';
import SmallTabbar from '@/components/tags/SmallTabbar';
import { fetchTagsFromTagsCollection } from '@/services/tags/firebase';
import { TagTypeForTagsCollection } from '@/types/firebase';
import React, { useEffect, useState } from 'react'
import TagsLoading from './loading';

// Main TagsPage component
export default function TagsPage() {
  const [tags, setTags] = useState<TagTypeForTagsCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTags = async () => {
      try {
        setLoading(true);
        const tagsData = await fetchTagsFromTagsCollection();
        setTags(tagsData);
      } catch (err) {
        console.error('Error loading tags:', err);
        setError('Failed to load tags');
      } finally {
        setLoading(false);
      }
    };

    loadTags();
  }, []);

  if (loading) {
    return <TagsLoading />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto">
        <SmallTabbar items={[
          { label: 'Trending', value: 'trending', path: '/tags/trending' },
          { label: 'Name', value: 'name', path: '/tags/name' }
        ]} />
        <TagsGrid tags={tags} />
      </div>
    </div>
  );
}