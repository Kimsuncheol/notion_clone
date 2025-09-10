import React from 'react';
import Image from 'next/image';
import { CustomUserProfile } from '@/types/firebase';

interface TagCardProps {
  author: CustomUserProfile;
}

export const TagCard: React.FC<TagCardProps> = ({ author }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative">
          {author.photoURL && typeof author.photoURL === 'string' ? (
            <Image
              src={author.photoURL}
              alt={author.displayName && typeof author.displayName === 'string' ? author.displayName : 'User'}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              width={64}
              height={64}
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-gray-200 dark:border-gray-600">
              <span className="text-white text-xl font-semibold">
                {(
                  (author.displayName && typeof author.displayName === 'string' ? author.displayName : '') ||
                  (author.email && typeof author.email === 'string' ? author.email : '') ||
                  'U'
                ).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {author.displayName && typeof author.displayName === 'string' ? author.displayName : 'Anonymous User'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {author.email && typeof author.email === 'string' ? author.email : ''}
          </p>
        </div>
      </div>
      
      {author.bio && (
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {author.bio}
        </p>
      )}
      
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <span className="font-medium">{author.postsCount}</span> posts
        </span>
        <span className="flex items-center gap-1">
          <span className="font-medium">{author.followersCount}</span> followers
        </span>
        <span className="flex items-center gap-1">
          <span className="font-medium">{author.followingCount}</span> following
        </span>
      </div>
      
      {author.location && (
        <div className="mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">📍 {author.location}</span>
        </div>
      )}
      
      {author.skills && author.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {author.skills.slice(0, 3).map((skill, index) => (
            <span
              key={skill.id || `skill-${author.id}-${index}`}
              className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
            >
              {skill.name}
            </span>
          ))}
          {author.skills.length > 3 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{author.skills.length - 3} more
            </span>
          )}
        </div>
      )}
      
      <div className="flex gap-2 mt-4">
        {author.github && (
          <a
            href={author.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="GitHub Profile"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        )}
        {author.website && (
          <a
            href={author.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Website"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.24-.456 3.279-.823-.12-1.669-.188-2.538-.222zm1.957 2.162c-.499 1.33-1.159 2.497-1.957 3.456v-3.62c.666.028 1.329.081 1.957.164zm-1.957-7.219v-3.015c.868-.034 1.715-.103 2.538-.222.244 1.039.397 2.136.456 3.279h-2.994v-.042zm0-5.014v-3.661c.806.969 1.471 2.15 1.971 3.496-.642.084-1.3.137-1.971.165zm2.703-3.267c1.237.496 2.354 1.228 3.29 2.146-.642.234-1.311.442-2.019.607-.344-.992-.775-1.91-1.271-2.753zm-7.241 13.56c-.244-1.039-.398-2.136-.456-3.279h2.994v3.057c-.869.034-1.715.102-2.538.222zm-2.184 1.447c.58.233 1.175.424 1.791.568-.456-1.329-.804-2.736-.956-4.15-.835.202-1.638.47-2.427.805.493.944 1.077 1.86 1.592 2.777zm-2.878-5.967c.8-.362 1.613-.642 2.478-.846.13-1.295.342-2.507.649-3.63-.673-.154-1.337-.34-1.985-.568-.646.982-1.171 2.055-1.542 3.244-.4.533-.777 1.08-1.142 1.643.515.462 1.045.901 1.542 1.157z"/>
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};
