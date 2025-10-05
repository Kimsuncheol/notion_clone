'use client'

import React from 'react'
export default function AIPageLayout({
  children,
  params: _params,
}: {
  children: React.ReactNode
  params: Promise<{ userId: string }>
}) {
  return (
    <div className='h-[calc(100vh-82px)]'>{children}</div>
  )
}
