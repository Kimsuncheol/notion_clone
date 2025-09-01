'use client';

import React, { useRef } from 'react'
import { Card, CardContent, CardMedia, Typography, Box, InputBase, InputAdornment, Link } from '@mui/material'
import MyPostSidebar from '../my-posts/MyPostSidebar';
import SearchIcon from '@mui/icons-material/Search';
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { MyPost } from '@/types/firebase';
import { useMyPostStore } from '@/store/myPostStore';

interface MyPostsProps {
  posts: MyPost[];
}

export default function MyPosts({ posts }: MyPostsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  return (
    <div className='w-full flex flex-col gap-25'>
      <MyPostSearchBar />
      <div className='w-full flex'>
        {/* chip */}
        <div className='w-[25%] px-10'>
          <MyPostSidebar />
        </div>
        <div className='w-[75%] h-full flex flex-col gap-25'>
          {posts.map((post) => (
            <MyPostCard key={post.id} post={post} formatDate={formatDate} truncateContent={truncateContent} />
          ))}
        </div>
      </div>
    </div>
  )
}

function MyPostCard({ post, formatDate, truncateContent }: { post: MyPost, formatDate: (dateString: string) => string, truncateContent: (content: string, maxLength?: number) => string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWidth: number = cardRef.current?.clientWidth || 0;

  return (
    <Link href={`/note/${post.id}`} underline="none">
      <Card
        key={post.id}
        sx={{
          backgroundColor: "transparent",
          color: "#fff",
          border: 0,
          borderRadius: "0.5rem",
          boxShadow: "none",
        }}
        ref={cardRef}
      >
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          color: '#fff',
        }}>
          {/* Thumbnail image - full width at top */}
          {post.thumbnail ? (
            <CardMedia
              component="img"
              sx={{
                width: cardWidth,
                height: cardWidth * 0.5,
                objectFit: 'cover'
              }}
              image={post.thumbnail}
              alt={post.title}
            />
          ) : (
            <CardContent
              sx={{
                backgroundColor: '#404040',
                width: cardWidth,
                height: cardWidth * 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              No thumbnail
            </CardContent>
          )}
          {/* Content section */}
          <CardContent sx={{
            padding: '0px',
          }}>
            {/* Title */}
            <Typography
              variant="h5"
              component="h2"
              sx={{ fontSize: '1.5rem', lineHeight: '1.3', fontWeight: 'bold', marginBottom: '16px' }}
            >
              {post.title}
            </Typography>

            {/* Content preview */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: '1rem',
                lineHeight: '1.7',
                color: '#6b7280',
                marginBottom: '16px'
              }}
            >
              {truncateContent(post.content, 200)}
            </Typography>

            {/* Bottom metadata */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid #6b7280',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.875rem',
                    color: '#9ca3af',
                    fontWeight: 500
                  }}
                >
                  {formatDate(post.createdAt.toISOString())}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.875rem',
                    color: '#9ca3af'
                  }}
                >
                  Views {Math.floor(Math.random() * 500) + 50}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.875rem',
                    color: '#9ca3af'
                  }}
                >
                  ♥ {post.comments.length}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.875rem',
                    color: '#9ca3af'
                  }}
                >
                  Subnotes {post.subNotes.length}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Link>
  )
}

function MyPostSearchBar() {
  const { searchQuery, setSearchQuery } = useMyPostStore();

  return (
    <div className='w-full flex justify-end'>
      <InputBase
        sx={{
          width: '25%',
          padding: '8px',
          border: '1px solid #fff',
          backgroundColor: 'transparent',
          color: '#fff',
        }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon sx={{ color: '#fff' }} />
          </InputAdornment>
        }
        endAdornment={
          <InputAdornment position="end">
            {searchQuery.length > 0 && (
              <ClearOutlinedIcon sx={{ color: '#fff', borderRadius: '50%', fontSize: '1.5rem', padding: '4px', '&:hover': { cursor: 'pointer', backgroundColor: 'rgba(255, 255, 255, 0.1)' } }} onClick={() => setSearchQuery('')} />
            )}
          </InputAdornment>
        }
        placeholder="Search"
      />
    </div>
  )
}