import React from 'react';
import { MyPost } from '@/types/firebase';
import Image from 'next/image';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import { mockPostsYouMightBeInterestedIn } from '@/constants/mockDatalist';
import Link from 'next/link';

interface PostsYouMightBeInterestedInGridProps {
  posts: MyPost[];
}

const PostsYouMightBeInterestedInGrid = React.memo(({ posts }: PostsYouMightBeInterestedInGridProps) => {
  const displayPosts = posts.length > 0 ? posts : mockPostsYouMightBeInterestedIn;

  return (
    <div className="px-2 py-4 flex flex-col items-center gap-10">
      <h2 className="text-white font-bold text-3xl mb-2">Posts you might be interested in</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayPosts.map((post) => (
          <Link href={`/note/${post.id}`} key={post.id}>
            <PostCard
              key={post.id}
              {...post}
            />
          </Link>
        ))}
      </div>
    </div>
  );
});

PostsYouMightBeInterestedInGrid.displayName = 'PostsYouMightBeInterestedInGrid';

export default PostsYouMightBeInterestedInGrid;

const PostCard = React.memo(({ title, content, authorName, createdAt, likeCount, thumbnail }: MyPost) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition-colors cursor-pointer">
      {thumbnail && (
        <div className="aspect-video bg-gray-700 relative">
          <Image
            width={100}
            height={100}
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
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
