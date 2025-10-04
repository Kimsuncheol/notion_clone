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
    <div className='min-h-screen'>{children}</div>
  )
}
