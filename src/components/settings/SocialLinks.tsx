'use client';

import { grayColor3 } from '@/constants/color';
import { fontSize } from '@/constants/size'
import { CustomUserProfile } from '@/types/firebase';
import { IconButton } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailSharpIcon from '@mui/icons-material/EmailSharp';

import React from 'react'

interface SocialLinksProps {
  userProfile: CustomUserProfile | null;
}

export default function SocialLinks({ userProfile }: SocialLinksProps) {
  return (
    <div className='flex flex-col gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='flex w-full gap-4'>
        <div className='font-semibold w-1/5' style={{ fontSize: fontSize }}>Social Links</div>
        <div className='w-4/5 flex flex-col gap-4'>
          <div className='text-[16px] font-semibold h-full flex items-center gap-2' style={{ color: grayColor3 }}>
            <IconButton
              component="a"
              href={`https://github.com/${userProfile?.github}`}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: grayColor3, display: 'flex', gap: 1 }}>
              <GitHubIcon />
              <span className='text-[16px] font-semibold'>{userProfile?.github || 'Anonymous'}</span>
            </IconButton>
          </div>
          <div className='text-[16px] font-semibold h-full flex items-center gap-2' style={{ color: grayColor3 }}>
            <IconButton
              component="a"
              href={`mailto:${userProfile?.email}`}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              sx={{ color: grayColor3, display: 'flex', gap: 1 }}>
            <EmailSharpIcon />
            <span className='text-[16px] font-semibold'>{userProfile?.email || 'Anonymous'}</span>
          </IconButton>
          </div>
        </div>
      </div>
      <div className='' style={{ color: grayColor3, fontSize: fontSize }}>Social information displayed on your profile in posts and blogs.</div>
    </div>
  )
}