import React, { useRef } from 'react'
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material'
import { mockPosts } from '@/constants/mockDatalist'
import MyPostSidebar from '../my-posts/MyPostSidebar';
import { MyPost } from '@/types/firebase';

export default function MyPosts() {
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
    <div className='w-full flex'>
      <div className='w-[25%] p-10'>
        <MyPostSidebar />
      </div>
      <div className='w-[75%] h-full flex flex-col gap-6'>
        {mockPosts.map((post) => (
          <MyPostCard key={post.id} post={post} formatDate={formatDate} truncateContent={truncateContent} />
        ))}
      </div>
    </div>
  )
}

function MyPostCard({ post, formatDate, truncateContent }: { post: MyPost, formatDate: (dateString: string) => string, truncateContent: (content: string, maxLength?: number) => string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWidth: number = cardRef.current?.clientWidth || 0;

  return (
    <Card key={post.id} className='hover:shadow-md transition-shadow duration-300 border-0 shadow-sm rounded-lg' sx={{
      backgroundColor: 'transparent',
      color: '#fff',
      '&:hover': {
        boxShadow: 'none',
      }
    }}
    ref={cardRef}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#fff',
      }}>
        {/* Thumbnail image - full width at top */}
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
                서브노트 {post.subNotes.length}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Box>
    </Card>
  )
}