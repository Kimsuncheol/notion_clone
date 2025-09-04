'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { grayColor8 } from '@/constants/color';
import Avatar from '@mui/material/Avatar';
interface TrendingCardProps {
  id: string;
  authorEmail: string;
  authorName?: string;
  createdAt: Date;
  updatedAt: Date;
  likeCount: number;
  authorAvatar?: string;
  commentCount: number;
  title: string;
  description?: string;
  imageUrl?: string;
}

const TrendingCard = React.memo(({ id, authorEmail, authorName, createdAt, updatedAt, likeCount, authorAvatar, commentCount, title, description, imageUrl }: TrendingCardProps) => {
  const cardRef = document.getElementById(`trending-card-${id}`);
  const cardWidth: number = cardRef?.clientWidth || 0;

  return (
    <Link href={`/${authorEmail}/note/${id}`} className='hover:-translate-y-1 transition-transform duration-300'>
      <div
        className="bg-white dark:bg-gray-800 overflow-hidden cursor-pointer group"
        id={`trending-card-${id}`}
      >
        {/* Image */}
        <div className="relative w-full bg-gray-200 dark:bg-gray-700" style={{ height: cardWidth * 0.5 }}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              style={{ height: '100%' }}
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw , (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
              <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-between" style={{ height: cardWidth * 0.7 }}>
          <div className='p-4 flex flex-col justify-between h-full'>
            {/* Title and Content */}
            <div className='flex-1 flex flex-col gap-2'>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {description}
              </p>
            </div>
            {/* Published Date and view count and comment count */}
            <div className='flex items-center gap-1'>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {/* {updatedAt? new Date(updatedAt).toLocaleDateString('ko-KR') : new Date(createdAt).toLocaleDateString('ko-KR')} */}
                {updatedAt ? new Date(updatedAt).toLocaleDateString('en-US') : new Date(createdAt).toLocaleDateString('en-US')}
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                &#8226;
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {commentCount} comments
              </span>
            </div>
          </div>
          {/* author name and like count */}
          <div className='px-4 py-2 border-t flex items-center justify-between' style={{ borderColor: grayColor8 }}>
            <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
              {/* Avatar component and author name */}
              <Avatar src={authorAvatar} alt={authorName} sx={{ width: 24, height: 24 }} />
              by {authorName}
            </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2">
              <span className='text-[16px]'>
                &#10084;
              </span>
              <span className="text-gray-600 dark:text-gray-400 text-sm">
                {likeCount}
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});

TrendingCard.displayName = 'TrendingCard';

export default TrendingCard;
