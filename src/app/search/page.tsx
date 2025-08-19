'use client';
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, Avatar, Chip, Typography, InputBase, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import Image from 'next/image'
import { mockPosts, mockTrendingItems } from '@/constants/mockDatalist'
import { useSearchParams } from 'next/navigation'
import ClearOutlinedIcon from '@mui/icons-material/ClearOutlined';
import { searchPageResultCardBgColor, settingsPageMintColor } from '@/constants/color';

interface SearchResult {
  id: string;
  title: string;
  content: string;
  thumbnail?: string;
  author: string;
  authorAvatar?: string;
  tags: string[];
  date: Date;
  commentsCount: number;
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams?.get('q') || ''

  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [totalResults, setTotalResults] = useState(0)

  // Convert mock data to search results format
  const convertToSearchResults = (query: string = ''): SearchResult[] => {
    const allResults: SearchResult[] = [
      ...mockPosts.map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        thumbnail: post.thumbnail,
        author: post.authorName,
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        tags: ['React', 'Frontend', 'Development'], // Mock tags
        date: post.createdAt,
        commentsCount: post.comments.length
      })),
      ...mockTrendingItems.map(item => ({
        id: item.id,
        title: item.title,
        content: item.content,
        thumbnail: item.imageUrl,
        author: 'SangYoonLee (이상윤)', // Mock author
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        tags: item.tags,
        date: new Date('2022-03-06'), // Mock date
        commentsCount: Math.floor(Math.random() * 50) + 1
      }))
    ]

    if (query.trim() === '') {
      return allResults
    }

    return allResults.filter(result =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.content.toLowerCase().includes(query.toLowerCase()) ||
      result.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    )
  }

  useEffect(() => {
    const results = convertToSearchResults(searchQuery)
    setSearchResults(results)
    setTotalResults(results.length)
  }, [searchQuery])


  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className=" text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Search Bar */}
          <InputBase
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              width: '100%',
              p: '12px',
              bg: 'gray.800',
              border: '1px solid #fff',
              color: '#fff',
            }}
            startAdornment={
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#fff' }} />
              </InputAdornment>
            }
            endAdornment={
              searchQuery.length > 0 && (
                <InputAdornment position="end" onClick={() => setSearchQuery('')}>
                  <ClearOutlinedIcon sx={{ color: '#fff' }} />
                </InputAdornment>
              )
            }
          />
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Count */}
        <div className="mb-6">
          <Typography variant="body1" className="text-gray-600 dark:text-gray-400">
            총 <span className="font-semibold text-green-600">{totalResults.toLocaleString()}</span>개의 포스트를 찾았습니다.
          </Typography>
        </div>

        {/* Search Results */}
        <div className="space-y-8">
          {searchResults.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </div>

        {/* No Results */}
        {searchResults.length === 0 && searchQuery && (
          <div className="text-center py-12">
            <Typography variant="h6" className="text-gray-500 dark:text-gray-400 mb-2">
              검색 결과가 없습니다
            </Typography>
            <Typography variant="body2" className="text-gray-400 dark:text-gray-500">
              다른 키워드로 검색해보세요
            </Typography>
          </div>
        )}
      </div>
    </div>
  )
}

function ResultCard({ result }: { result: SearchResult }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content
  }

  // The width of the card
  const cardRef = useRef<HTMLDivElement>(null);
  const cardWidth: number = cardRef.current?.clientWidth || 0;

  return (
    <Card key={result.id} className="result-card" ref={cardRef} sx={{
      border: 'none',
      boxShadow: 'none',
      backgroundColor: 'transparent',
      transition: 'none',
      color: '#fff',
      '&:hover': {
        boxShadow: 'none',
      }
    }}>
      <CardContent sx={{
        padding: '0px'
      }}>
        <div className="">
          {/* Author Info */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar
              src={result.authorAvatar}
              alt={result.author}
              sx={{ width: 32, height: 32 }}
            />
            <Typography variant="body2" className="font-medium text-gray-700 dark:text-gray-300">
              {result.author}
            </Typography>
          </div>

          <div className="flex gap-6">
            {/* Content */}
            <div className="flex-1 flex flex-col gap-4">
              {result.thumbnail && (
                <div className="">
                  <Image
                    src={result.thumbnail}
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
                }}
              >
                {truncateContent(result.content)}
              </Typography>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4 text-sm">
                {result.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      borderColor: 'transparent',
                      backgroundColor: searchPageResultCardBgColor,
                      padding: '16px 8px',
                      color: settingsPageMintColor,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  />
                ))}
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span>{formatDate(result.date)}</span>
                <span>&#8226;</span>
                <span>{result.commentsCount}개의 댓글</span>
                <span>&#8226;</span>
                <span>&#10084;</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
