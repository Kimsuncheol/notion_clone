import { Skeleton } from '@mui/material'
import React from 'react'

export default function skeletonForFavoritesList() {
  return (
    <div className="mb-4">
      <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
      <div className="ml-4 flex flex-col gap-1 mt-1">
        <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
      </div>
    </div>
  )
}
