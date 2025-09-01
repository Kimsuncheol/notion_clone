import React from 'react'
import { Card, CardContent, CardMedia, Typography, Link } from '@mui/material'
import { SeriesType } from '@/types/firebase'
import { grayColor2 } from '@/constants/color';

interface MyPostSeriesProps {
  series: SeriesType[];
  userId?: string;
}

export default function MyPostSeries({ series, userId }: MyPostSeriesProps) {

  return (
    <div className='w-[75%] h-full p-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        {series.map((seriesItem) => (
          <Link href={userId ? `/${userId}/series/${encodeURIComponent(seriesItem.title)}` : `#`} key={seriesItem.id + seriesItem.title} underline="none">
            <Card
              className='cursor-pointer'
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                backgroundColor: grayColor2,
                boxShadow: 'none',
              }}
            >
              {/* Thumbnail with book icon placeholder */}
              { seriesItem.thumbnail ? (
              <CardMedia
                component="img"
                image={seriesItem.thumbnail}
                alt={seriesItem.title}
                sx={{
                  height: 180,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px 8px 0 0'
                }}
              />
              ) : (
                <CardMedia
                  component="div"
                  sx={{
                    height: 180,
                    backgroundColor: '#404040',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px 8px 0 0'
                  }}
                >
                  No thumbnail
                </CardMedia>
              )}

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
                    color: 'white',
                    mb: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {seriesItem.title}
                </Typography>

                {/* Metadata */}
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    fontSize: '0.875rem',
                    lineHeight: 1.5
                  }}
                >
                  {/* {seriesItem.subNotes.length}개의 포스트 • 마지막 업데이트 {formatDate(seriesItem.updatedAt)} */}
                </Typography>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
