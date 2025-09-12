'use client';
import React, { useRef } from 'react';
import { Card, CardContent, Avatar, Chip, Typography } from '@mui/material';
import Image from 'next/image';
import { FirebaseNoteContent } from '@/types/firebase';
import { grayColor4, mintColor1 } from '@/constants/color';

interface ResultCardProps {
  result: FirebaseNoteContent;
}

export default function ResultCard({ result }: ResultCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const cardWidth: number = cardRef.current?.clientWidth || 0;

  return (
    <Card 
      key={result.id} 
      className="result-card" 
      ref={cardRef} 
      sx={{
        border: 'none',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        transition: 'all 0.2s ease-in-out',
        color: '#fff',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent sx={{ padding: '0px' }}>
        <div className="">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
              alt={result.authorName || 'Anonymous'}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" className="font-medium text-gray-700 dark:text-gray-300">
              {result.authorName || 'Anonymous'}
            </Typography>
          </div>

          <div className="flex gap-6">
            {/* Content */}
            <div className="flex-1 flex flex-col gap-4">
              {result.thumbnailUrl && (
                <div className="">
                  <Image
                    src={result.thumbnailUrl}
                    alt={result.title}
                    width={cardWidth}
                    height={cardWidth * 0.75}
                    objectFit="contain"
                  />
                </div>
              )}

              {/* Title */}
              <Typography
                variant="h3"
                component="h2"
                sx={{
                  fontSize: '1.75rem',
                  fontWeight: 'bold',
                  marginBottom: '0.5rem',
                  lineHeight: '1.4',
                  cursor: 'pointer',
                  '&:hover': {
                    color: '#3b82f6',
                  }
                }}
              >
                {result.title}
              </Typography>

              {/* Description */}
              <Typography
                variant="body2"
                sx={{
                  fontSize: '1rem',
                  marginBottom: '0.5rem',
                  lineHeight: '1.4',
                  color: 'gray.50',
                }}
              >
                {truncateContent(result.description || '')}
              </Typography>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4 text-sm">
                {result.tags && result.tags.length > 0 && result.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={typeof tag === 'string' ? tag : tag.name}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderColor: 'transparent',
                      backgroundColor: grayColor4,
                      padding: '16px 8px',
                      color: mintColor1,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  />
                ))}
                {(!result.tags || result.tags.length === 0) && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">No tags</span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(result.updatedAt || result.createdAt)}</span>
                <span>&#8226;</span>
                <span>{result.comments?.length || 0}개의 댓글</span>
                <span>&#8226;</span>
                <span>&#10084; {result.likeCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}