import TrendingHeader from '@/components/trending/TrendingHeader'
import { grayColor2 } from '@/constants/color'
import React from 'react'

export default function MyPostLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='w-[80%] min-h-screen px-2 mx-auto' style={{ backgroundColor: grayColor2 }}>
      <TrendingHeader />
      <div className='px-2'>
        {children}
      </div>
    </div>
  )
}
