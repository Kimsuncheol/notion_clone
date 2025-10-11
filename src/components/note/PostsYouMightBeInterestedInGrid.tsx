import React, { useEffect, useMemo, useState } from 'react';
import { MyPost } from '@/types/firebase';
import Image from 'next/image';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
// import { mockPostsYouMightBeInterestedIn } from '@/constants/mockDatalist';
import Link from 'next/link';
import { fetchRecommendedUsers, fetchSimilarNotes } from '@/services/recommendation/serverRecommendations';

const EMPTY_POSTS: MyPost[] = [];

interface PostsYouMightBeInterestedInGridProps {
  posts?: MyPost[];
  isLoading?: boolean;
  userId?: string | null;
  noteId?: string | null;
  limit?: number;
}

const PostsYouMightBeInterestedInGrid = React.memo(({
  posts,
  isLoading = false,
  userId,
  noteId,
  limit,
}: PostsYouMightBeInterestedInGridProps) => {
  const [fetchedPosts, setFetchedPosts] = useState<MyPost[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
  const normalizedNoteId = typeof noteId === 'string' ? noteId.trim() : '';
  const externalPosts = posts ?? EMPTY_POSTS;
  const hasExternalPosts = externalPosts.length > 0;
  const requestLimit = Number.isInteger(limit) && typeof limit === 'number' && limit > 0 ? Math.floor(limit) : undefined;

  useEffect(() => {
    const targetId = normalizedNoteId || normalizedUserId;
    if (!targetId) {
      setFetchedPosts([]);
      setIsFetching(false);
      return;
    }

    if (hasExternalPosts) {
      setFetchedPosts([]);
      setIsFetching(false);
      return;
    }

    let isActive = true;
    setIsFetching(true);

    const fetchPromise = normalizedNoteId
      ? (requestLimit ? fetchSimilarNotes(normalizedNoteId, requestLimit) : fetchSimilarNotes(normalizedNoteId))
      : (requestLimit ? fetchRecommendedUsers(normalizedUserId, requestLimit) : fetchRecommendedUsers(normalizedUserId));

    fetchPromise
      .then(results => {
        if (!isActive) {
          return;
        }
        const limited = requestLimit ? results.slice(0, requestLimit) : results;
        setFetchedPosts(limited);
      })
      .catch(error => {
        console.error('Failed to fetch recommendations:', error);
        if (!isActive) {
          return;
        }
        setFetchedPosts([]);
      })
      .finally(() => {
        if (isActive) {
          setIsFetching(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [normalizedUserId, normalizedNoteId, requestLimit, hasExternalPosts]);

  const displayPosts = useMemo(() => {
    if (hasExternalPosts) {
      return externalPosts;
    }
    return fetchedPosts;
  }, [externalPosts, fetchedPosts, hasExternalPosts]);

  const combinedLoading = isLoading || isFetching;
  const shouldUseFallback = !combinedLoading && displayPosts.length === 0;
  const showLoadingState = combinedLoading && displayPosts.length === 0;

  return (
    <div className="px-2 py-4 flex flex-col items-center gap-10 mb-8">
      <h2 className="text-white font-bold text-3xl mb-2">Posts you might be interested in</h2>
      {showLoadingState && (
        <p className="text-gray-400 text-sm text-center">
          Analyzing your recent activity to personalize these recommendations...
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
        {displayPosts.map((post) => (
          <Link href={`/${post.authorEmail}/note/${post.id}`} key={post.id}>
            <PostCard
              key={post.id}
              {...post}
            />
          </Link>
        ))}
      </div>
      {shouldUseFallback && (
        <p className="text-gray-400 text-xs text-center">
          Explore and like more notes to unlock personalized suggestions.
        </p>
      )}
    </div>
  );
});

PostsYouMightBeInterestedInGrid.displayName = 'PostsYouMightBeInterestedInGrid';

export default PostsYouMightBeInterestedInGrid;

const PostCard = React.memo((post: MyPost & { thumbnail?: string }) => {
  const {
    title,
    content,
    authorName,
    createdAt,
    likeCount,
    thumbnail,
    thumbnailUrl,
  } = post;

  const coverImage =
    (typeof thumbnail === 'string' && thumbnail.trim()) ||
    (typeof thumbnailUrl === 'string' && thumbnailUrl.trim()) ||
    '/note_logo.png';

  return (
    // when hover, the card should be moved up a bit and smoothly
    <div className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:-translate-y-1 transition-transform duration-300">
      <div className="aspect-video bg-gray-700 relative">
        <Image
          width={100}
          height={100}
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-white font-medium text-sm mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-300 text-xs mb-3 line-clamp-3">
          {content}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{createdAt.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-xs text-white">{authorName.charAt(0)}</span>
            </div>
            <span className="text-xs text-gray-300">by {authorName}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FavoriteBorderOutlinedIcon sx={{ fontSize: 16, color: '#ff6347' }} />
            <span className="text-xs text-gray-400">{likeCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

PostCard.displayName = 'PostCard';
