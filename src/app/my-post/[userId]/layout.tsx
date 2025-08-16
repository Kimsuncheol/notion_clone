import TrendingHeader from '@/components/trending/TrendingHeader'
import { bgColor, trendingPageBgColor } from '@/constants/color'
import React from 'react'

export default function MyPostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='w-full min-h-screen px-2' style={{ backgroundColor: trendingPageBgColor }}>
      <TrendingHeader />
      <div className='px-2'>
        {children}
      </div>
    </div>
  )
}
