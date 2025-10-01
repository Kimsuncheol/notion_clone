'use client';
import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { grayColor8 } from '@/constants/color';
import TrendingCardImage from '@/app/components/trendingCard/TrendingCardImage';
import TrendingCardBody from '@/app/components/trendingCard/TrendingCardBody';
import TrendingCardFooter from '@/app/components/trendingCard/TrendingCardFooter';
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(300); // Default width

  useEffect(() => {
    const updateCardWidth = () => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.clientWidth);
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  return (
    <Link href={`/${authorEmail}/note/${id}`} className='hover:-translate-y-1 transition-transform duration-300'>
      <div
        ref={cardRef}
        className="group cursor-pointer overflow-hidden bg-white dark:bg-gray-800"
      >
        <TrendingCardImage title={title} imageUrl={imageUrl} height={cardWidth * 0.5} />
        <TrendingCardBody
          title={title}
          description={description}
          commentCount={commentCount}
          publishedLabel={updatedAt ? new Date(updatedAt).toLocaleDateString('en-US') : new Date(createdAt).toLocaleDateString('en-US')}
          contentHeight={cardWidth * 0.7}
        />

        <TrendingCardFooter
          authorAvatar={authorAvatar}
          authorName={authorName}
          likeCount={likeCount}
          borderColor={grayColor8}
        />
      </div>
    </Link>
  );
});

TrendingCard.displayName = 'TrendingCard';

export default TrendingCard;
