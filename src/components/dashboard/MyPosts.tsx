import React from 'react'
import { Card, CardContent, CardHeader, CardMedia, Typography, Box } from '@mui/material'
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
    <div className='w-full h-full flex flex-col gap-4'>
      {mockPosts.map((post) => (
        <Card key={post.id} className='hover:shadow-lg transition-shadow duration-200'>
          <Box className='flex flex-col md:flex-row'>
            <CardMedia
              component="img"
              sx={{
                width: { xs: '100%', md: 200 },
                height: { xs: 200, md: 150 }
              }}
              image={post.thumbnail}
              alt={post.title}
            />
            <Box className='flex-1'>
              <CardHeader
                title={
                  <Typography variant="h6" component="h2" className='font-semibold'>
                    {post.title}
                  </Typography>
                }
                subheader={
                  <Box className='flex flex-col gap-1'>
                    <Typography variant="caption" color="text.secondary">
                      By {post.authorName} • {formatDate(post.createdAt)}
                    </Typography>
                    
                  </Box>
                }
              />
              <CardContent className='pt-0'>
                <Typography variant="body2" color="text.secondary" className='mb-3'>
                  {truncateContent(post.content)}
                </Typography>
                
                <Box className='flex flex-wrap gap-1 mb-3'>
                  
                </Box>
                
                <Box className='flex justify-between items-center text-sm text-gray-600'>
                  <Typography variant="caption">
                    {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="caption">
                    {post.subNotes.length} sub-note{post.subNotes.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>
              </CardContent>
            </Box>
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
