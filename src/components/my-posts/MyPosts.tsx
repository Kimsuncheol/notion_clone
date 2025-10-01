'use client';

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardMedia, Typography, Box, InputBase, InputAdornment, Link } from '@mui/material'
import ViewListRoundedIcon from '@mui/icons-material/ViewListRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import MyPostSidebar from './MyPostSidebar';
import SearchIcon from '@mui/icons-material/Search';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import CircularProgress from '@mui/material/CircularProgress';

import type { MyPost, TagType } from '@/types/firebase';
import { useMyPostStore } from '@/store/myPostStore';
import { ngramSearchObjects, type SearchConfig } from '@/utils/ngram';
import { grayColor1 } from '@/constants/color';

interface PostsState {
  items: MyPost[];
  hasMore: boolean;
  lastDocId?: string;
}

const PAGE_SIZE = 10;

type PostSearchIndexEntry = {
  id: string;
  title: string;
  description: string;
  tagsText: string;
  contentSnippet: string;
  original: MyPost;
};

interface MyPostsProps {
  userId: string;
  userEmail: string;
  currentTag: string;
  currentTagId?: string;
  posts: MyPost[];
  tags?: TagType[];
  initialLastDocId?: string;
  initialHasMore?: boolean;
}

export default function MyPosts({ userId, userEmail, posts, tags = [], currentTag = 'All', currentTagId, initialLastDocId, initialHasMore = false }: MyPostsProps) {
  const [state, setState] = useState<PostsState>({
    items: posts ?? [],
    hasMore: initialHasMore,
    lastDocId: initialLastDocId,
  });
  const [layoutStyle, setLayoutStyle] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchQuery = useMyPostStore((store) => store.searchQuery);

  const trimmedSearchQuery = useMemo(() => searchQuery.trim(), [searchQuery]);
  const isSearching = trimmedSearchQuery.length > 0;

  const searchConfig = useMemo<SearchConfig>(() => ({
    n: 2,
    threshold: 0.25,
    caseSensitive: false,
    includeSpaces: false,
    algorithm: 'jaccard',
  }), []);

  const searchIndex = useMemo<PostSearchIndexEntry[]>(() => {
    return state.items.map((post) => ({
      id: post.id,
      title: post.title ?? '',
      description: post.description ?? '',
      tagsText: (post.tags ?? []).map((tag) => tag.name).join(' '),
      contentSnippet: post.content ? post.content.slice(0, 600) : '', // limit to keep n-gram generation lightweight
      original: post,
    }));
  }, [state.items]);

  const filteredPosts = useMemo(() => {
    if (!isSearching) {
      return state.items;
    }

    const results = ngramSearchObjects(
      trimmedSearchQuery,
      searchIndex,
      ['title', 'description', 'tagsText', 'contentSnippet'],
      {
        ...searchConfig,
        maxResults: Math.max(searchIndex.length, 10),
      }
    );

    if (results.length > 0) {
      return results.map((result) => result.item.original);
    }

    const normalizedQuery = trimmedSearchQuery.toLowerCase();

    return searchIndex
      .filter(({ title, description, tagsText, contentSnippet }) => {
        const lowerTitle = title.toLowerCase();
        const lowerDescription = description.toLowerCase();
        const lowerTags = tagsText.toLowerCase();
        const lowerContent = contentSnippet.toLowerCase();

        return (
          lowerTitle.includes(normalizedQuery) ||
          lowerDescription.includes(normalizedQuery) ||
          lowerTags.includes(normalizedQuery) ||
          lowerContent.includes(normalizedQuery)
        );
      })
      .map((entry) => entry.original);
  }, [isSearching, trimmedSearchQuery, searchConfig, searchIndex, state.items]);

  const showNoResults = isSearching && filteredPosts.length === 0;

  useEffect(() => {
    setState({
      items: posts ?? [],
      hasMore: initialHasMore,
      lastDocId: initialLastDocId,
    });
  }, [posts, initialLastDocId, initialHasMore]);

  const handleLoadMore = useCallback(async () => {
    if (isLoading || !state.hasMore) {
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        userEmail,
        limit: PAGE_SIZE.toString(),
      });

      const normalizedTag = currentTag.trim().toLowerCase();
      if (normalizedTag !== 'all') {
        params.append('tag', normalizedTag);
        if (currentTagId) {
          params.append('tagId', currentTagId);
        }
      }

      if (state.lastDocId) {
        params.append('startAfterDocId', state.lastDocId);
      }

      const response = await fetch(`/api/posts?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to load more posts');
      }

      const data = await response.json();

      setState((prev) => ({
        items: [...prev.items, ...(data.posts ?? [])],
        hasMore: Boolean(data.hasMore),
        lastDocId: data.lastDocId ?? prev.lastDocId,
      }));
    } catch (error) {
      console.error('Error loading more posts:', error);
      setState((prev) => ({ ...prev, hasMore: false }));
    } finally {
      setIsLoading(false);
    }
  }, [currentTag, currentTagId, isLoading, state.hasMore, state.lastDocId, userEmail]);

  useEffect(() => {
    if (isSearching || !state.hasMore) {
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting) {
        handleLoadMore();
      }
    }, { rootMargin: '200px', threshold: 0.1 });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [handleLoadMore, isSearching, state.hasMore]);

  const formatDate = (dateInput: Date | string) => {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateContent = (content: string, maxLength: number = 120) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  // extract currentTag from url in SSR

  return (
    <div className='w-full flex flex-col gap-12'>
      <MyPostSearchBar />
      <div className='w-full flex h-full'>
        {/* chip */}
        <div className='w-[25%] px-10 h-fit sticky top-10'>
          <MyPostSidebar userId={userId} userEmail={userEmail} tags={tags} currentTag={currentTag} />
        </div>
        <div className='w-[75%] h-full flex flex-col gap-6'>
          <div className='flex justify-end gap-2'>
            <button
              type='button'
              aria-label='List view'
              onClick={() => setLayoutStyle('list')}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                layoutStyle === 'list'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
              }`}
            >
              <ViewListRoundedIcon fontSize='small' />
            </button>
            <button
              type='button'
              aria-label='Grid view'
              onClick={() => setLayoutStyle('grid')}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${
                layoutStyle === 'grid'
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white'
              }`}
            >
              <GridViewRoundedIcon fontSize='small' />
            </button>
          </div>
          {filteredPosts.length > 0 ? (
            <div className={layoutStyle === 'grid' ? 'grid grid-cols-1 gap-10 md:grid-cols-2' : 'flex flex-col gap-25'}>
              {filteredPosts.map((post) => (
                <MyPostCard
                  key={post.id}
                  post={post}
                  layoutStyle={layoutStyle}
                  formatDate={formatDate}
                  truncateContent={truncateContent}
                />
              ))}
            </div>
          ) : !isLoading ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '48px 16px',
                borderRadius: '12px',
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                color: '#9ca3af',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#e5e7eb', textAlign: 'center' }}>
                {showNoResults ? `No posts match "${trimmedSearchQuery}"` : 'You have no posts yet'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af', textAlign: 'center', maxWidth: '320px' }}>
                {showNoResults ? 'Try a broader keyword or check for typos.' : 'Create a new post to see it listed here.'}
              </Typography>
            </Box>
          ) : null}
          {!isSearching && filteredPosts.length > 0 && state.hasMore && (
            <div ref={sentinelRef} className='h-1' />
          )}
          {!isSearching && isLoading && (
            <div className='w-full flex justify-center py-6'>
              <CircularProgress />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function MyPostCard({ post, layoutStyle, formatDate, truncateContent }: { post: MyPost; layoutStyle: 'list' | 'grid'; formatDate: (dateInput: Date | string) => string; truncateContent: (content: string, maxLength?: number) => string }) {
  const imageHeight = layoutStyle === 'grid' ? 200 : 260;
  const descriptionLength = layoutStyle === 'grid' ? 150 : 200;

  return (
    <Link
      href={`/${post.authorEmail}/note/${post.id}`}
      underline="none"
      sx={{ display: 'block', height: '100%' }}
    >
      <Card
        key={post.id}
        sx={{
          backgroundColor: 'transparent',
          color: '#fff',
          border: 0,
          borderRadius: '0.5rem',
          boxShadow: 'none',
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '16px', color: '#fff', height: '100%' }}>
          <Box
            sx={{
              width: '100%',
              height: imageHeight,
              borderRadius: '0.75rem',
              overflow: 'hidden',
              backgroundColor: '#404040',
            }}
          >
            {post.thumbnailUrl ? (
              <CardMedia
                component="img"
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                image={post.thumbnailUrl}
                alt={post.title}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  fontSize: '0.9rem'
                }}
              >
                No thumbnail
              </Box>
            )}
          </Box>

          <CardContent sx={{ padding: '0px', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Typography variant="h5" component="h2" sx={{ fontSize: '1.5rem', lineHeight: '1.3', fontWeight: 'bold' }}>
              {post.title}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: '1rem', lineHeight: '1.7', color: '#6b7280', flexGrow: 1 }}
            >
              {truncateContent(post.description || '', descriptionLength)}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid #6b7280',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.875rem', color: '#9ca3af', fontWeight: 500 }}
                >
                  {formatDate(post.createdAt)}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Views {Math.floor(Math.random() * 500) + 50}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography variant="caption" sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  ♥ {post.likeCount}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                  Comments {post.comments.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Link>
  );
}

function MyPostSearchBar() {
  const searchQuery = useMyPostStore((store) => store.searchQuery);
  const setSearchQuery = useMyPostStore((store) => store.setSearchQuery);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, [setSearchQuery]);

  const handleClear = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      handleClear();
    }
  }, [handleClear]);

  const handleBlur = useCallback(() => {
    const trimmed = searchQuery.trim();
    if (trimmed !== searchQuery) {
      setSearchQuery(trimmed);
    }
  }, [searchQuery, setSearchQuery]);

  const hasValue = searchQuery.length > 0;

  return (
    <div className='w-full flex justify-end sticky top-10'>
      <InputBase
        id='my-posts-search-bar'
        aria-label='Search posts'
        sx={{
          width: '25%',
          padding: '8px',
          border: '1px solid #fff',
          backgroundColor: grayColor1,
          color: '#fff',
        }}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#fff' }} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            {hasValue && (
              <ClearOutlinedIcon
                sx={{
                  color: '#fff',
                  borderRadius: '50%',
                  fontSize: '1.5rem',
                  padding: '4px',
                  '&:hover': { cursor: 'pointer', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                }}
                onClick={handleClear}
              />
            )}
          </InputAdornment>
        }
        placeholder="Search"
      />
    </div>
  )
}
