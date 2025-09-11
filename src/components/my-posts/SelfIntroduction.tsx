'use client';

import { firebaseApp } from '@/constants/firebase';
import { Avatar, IconButton } from '@mui/material'
import { getAuth } from 'firebase/auth';
import React from 'react'
import { CustomUserProfile } from '@/types/firebase'
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailSharpIcon from '@mui/icons-material/EmailSharp';
import { grayColor3 } from '@/constants/color';

interface SelfIntroductionProps {
  userProfile: CustomUserProfile | null;
  isPreview?: boolean;
}

export default function SelfIntroduction({ userProfile, isPreview = false }: SelfIntroductionProps) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const avatarSize = 140;

  return (
    <div className='flex flex-col gap-4 py-10'>
      {/* Avatar and Name */}
      <div className={`w-full flex items-center gap-10 border-b border-gray-300 pb-4 ${isPreview ? 'border-none' : ''}`} id='self-introduction'>
        <Avatar src={userProfile?.photoURL || ''} alt={user?.displayName || ''} sx={{ width: avatarSize, height: avatarSize }} />
        <div className='flex flex-col gap-1'>
          <div className='text-2xl font-bold'>{userProfile?.displayName || 'User'}</div>
          <div className='text-lg text-gray-500'>{userProfile?.email || ''}</div>
        </div>
      </div>
      {/* Followers and Following */}

      <div className='w-full flex flex-col gap-4 pb-10'>
        {!isPreview && (
          <div className='flex gap-4 items-center justify-end'>
            <div className='text-lg font-bold flex gap-2 items-center'>
              <div className=''>{userProfile?.followersCount || 0}</div>
              <div className='text-sm text-gray-500'>Followers</div>
            </div>
            <div className='text-lg font-bold flex gap-2 items-center'>
              <div className=''>{userProfile?.followingCount || 0}</div>
              <div className='text-sm text-gray-500'>Following</div>
            </div>
            <div className='text-lg font-bold flex gap-2 items-center'>
              <div className=''>{userProfile?.postCount || 0}</div>
              <div className='text-sm text-gray-500'>Posts</div>
            </div>
          </div>
        )}
        <div className='flex flex-col items-start gap-4'>
          {userProfile?.github && (
            <IconButton
              component="a"
              href={`https://github.com/${userProfile.github}`}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: grayColor3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <GitHubIcon />
              <div className='text-sm text-gray-500'>{userProfile.github}</div>
            </IconButton>
          )}
          <IconButton
            component="a"
            href={`mailto:${userProfile?.email}`}
            title='Email'
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ color: grayColor3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailSharpIcon />
            <div className='text-sm text-gray-500'>{userProfile?.email}</div>
          </IconButton>
        </div>
      </div>
    </div>
  )
}
