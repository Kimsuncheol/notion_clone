import { Skeleton } from '@mui/material';
import React from 'react'

export default function skeletonForFolderTree() {
  return (
    <div className="flex flex-col gap-2 px-2">
      <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
      <div className="ml-4 flex flex-col gap-1">
        <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="80%" height={24} sx={{ borderRadius: 1 }} />
      </div>
      <Skeleton variant="rectangular" width="100%" height={32} sx={{ borderRadius: 1 }} />
      <div className="ml-4 flex flex-col gap-1">
        <Skeleton variant="rectangular" width="90%" height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width="85%" height={24} sx={{ borderRadius: 1 }} />
      </div>
    </div>
  )
}
