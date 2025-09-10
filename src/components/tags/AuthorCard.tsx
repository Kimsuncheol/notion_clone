import { CustomUserProfile } from '@/types/firebase';
import { mintColor1 } from '@/constants/color';
import Link from 'next/link';
import React from 'react';

interface AuthorCardProps {
  author: CustomUserProfile;
}

export default function AuthorCard({ author }: AuthorCardProps) {
  return (
    <Link
      href={`/profile/${author.id}`}
      className="group bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img
            src={author.photoURL || '/default-avatar.png'}
            alt={`${author.displayName}'s profile`}
            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/default-avatar.png';
            }}
          />
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
            {author.displayName || 'Anonymous'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {author.email}
          </p>
        </div>
      </div>

      {/* Bio Section */}
      {author.bio && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {author.bio}
        </p>
      )}

      {/* Stats Section */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {author.postsCount || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Posts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {author.followersCount || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {author.followingCount || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Following</div>
          </div>
        </div>
      </div>

      {/* Location */}
      {author.location && (
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {author.location}
          </span>
        </div>
      )}

      {/* Skills */}
      {author.skills && author.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {author.skills.slice(0, 3).map((skill, index) => (
            <span
              key={skill.id || index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            >
              {skill.name}
            </span>
          ))}
          {author.skills.length > 3 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
              +{author.skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Social Links */}
      <div className="flex gap-3">
        {author.github && (
          <a
            href={`https://github.com/${author.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        )}
        {author.website && (
          <a
            href={author.website.startsWith('http') ? author.website : `https://${author.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>

      {/* Join Date */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Joined {new Date(author.joinedAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          })}
        </p>
      </div>
    </Link>
  );
}