import TrendingHeader from '@/components/trending/TrendingHeader'
import { trendingPageBgColor } from '@/constants/color'
import React from 'react'

export default function MyPostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='max-w-7xl min-h-screen px-2 mx-auto' style={{ backgroundColor: trendingPageBgColor }}>
      <TrendingHeader />
      <div className='px-2'>
        {children}
      </div>
    </div>
  )
}
