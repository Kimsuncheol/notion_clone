import React from 'react'
import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material'
import { mockPostSeries } from '@/constants/mockDatalist'

export default function MyPostSeries() {
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',  
      day: 'numeric'
    });
  };

  return (
    <div className='w-[75%] h-full p-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        {mockPostSeries.map((series) => (
          <div key={series.id}>
            <Card 
              className='hover:shadow-lg transition-shadow duration-300 cursor-pointer'
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                border: '1px solid #e5e7eb'
              }}
            >
              {/* Thumbnail with book icon placeholder */}
              <CardMedia
                component="div"
                sx={{
                  height: 180,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px 8px 0 0'
                }}
              >
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: '#9ca3af'
                  }}
                >
                  📖
                </Box>
              </CardMedia>
              
              {/* Content */}
              <CardContent 
                className='flex-1 p-4'
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                {/* Title */}
                <Typography 
                  variant="h6" 
                  component="h3"
                  sx={{
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    color: '#111827',
                    mb: 2,
                    lineHeight: 1.4
                  }}
                >
                  {series.title}
                </Typography>
                
                {/* Metadata */}
                <Typography 
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}
                >
                  {series.subNotes.length}개의 포스트 • 마지막 업데이트 {formatDate(series.updatedAt)}
                </Typography>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
