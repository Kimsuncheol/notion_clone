import React from 'react'
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material'
import { mockPosts } from '@/constants/mockDatalist'

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
    <div className='w-full h-full flex flex-col gap-6'>
      {mockPosts.map((post) => (
        <Card key={post.id} className='hover:shadow-md transition-shadow duration-300 border-0 shadow-sm'>
          <Box className='flex flex-col'>
            {/* Thumbnail image - full width at top */}
            <CardMedia
              component="img"
              sx={{
                width: '100%',
                height: 240,
                objectFit: 'cover'
              }}
              image={post.thumbnail}
              alt={post.title}
              className='rounded-t-lg'
            />
            
            {/* Content section */}
            <CardContent className='p-6'>
              {/* Title */}
              <Typography 
                variant="h5" 
                component="h2" 
                className='font-bold text-gray-900 mb-4 leading-tight'
                sx={{ fontSize: '1.5rem', lineHeight: '1.3' }}
              >
                {post.title}
              </Typography>
              
              {/* Content preview */}
              <Typography 
                variant="body1" 
                color="text.secondary" 
                className='mb-6 leading-relaxed'
                sx={{ 
                  fontSize: '0.95rem',
                  lineHeight: '1.7',
                  color: '#6b7280'
                }}
              >
                {truncateContent(post.content, 200)}
              </Typography>
              
              {/* Bottom metadata */}
              <Box className='flex justify-between items-center pt-4 border-t border-gray-100'>
                <Box className='flex items-center gap-4'>
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
                
                <Box className='flex items-center gap-4'>
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
      ))}
    </div>
  )
}
// export default function MyPosts() {
//   return (
//     <div className='w-full h-full flex flex-col gap-4'>
//       <Card>
//         <CardHeader title='My Posts' />
//         <CardContent>
//           <Typography>My Posts</Typography>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
