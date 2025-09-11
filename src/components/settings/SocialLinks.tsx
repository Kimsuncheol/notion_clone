'use client';

import { grayColor3, mintColor1 } from '@/constants/color';
import { fontSize } from '@/constants/size'
import { CustomUserProfile } from '@/types/firebase';
import { IconButton, TextField } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import EmailSharpIcon from '@mui/icons-material/EmailSharp';
import { updateUserGithub } from '@/services/settings/firebase';

import React, { useState } from 'react'

interface SocialLinksProps {
  userProfile: CustomUserProfile | null;
}

export default function SocialLinks({ userProfile }: SocialLinksProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(userProfile?.email || '');
  const [github, setGithub] = useState<string>(userProfile?.github || '');

  const handleSave = async () => {
    try {
      await updateUserGithub(github);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating github:', error);
    }
  };

  return (
    <div className='flex flex-col gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='flex w-full gap-4'>
        <div className='font-semibold w-1/5' style={{ fontSize: fontSize }}>Social Links</div>
        <div className='w-4/5 flex gap-4'>
          {/* <div className='w-3/5 flex flex-col gap-4'> */}
          <div className="w-full flex flex-col gap-4">
            <SocialLinksItem
              icon={<GitHubIcon />}
              href={`https://github.com/${userProfile?.github}`}
              value={github}
              isEditing={isEditing}
              setValue={setGithub}
            />
            <SocialLinksItem
              icon={<EmailSharpIcon />}
              href={`mailto:${userProfile?.email}`}
              value={email} isEditing={isEditing}
              setValue={setEmail}
            />
          </div>
          <div className='text-[16px] font-semibold cursor-pointer text-right' style={{ color: mintColor1 }} onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}>{isEditing ? 'Save' : 'Edit'}</div>
        </div>
      </div>
      <div className='' style={{ color: grayColor3, fontSize: fontSize }}>Social information displayed on your profile in posts and blogs.</div>
    </div >
  )
}

function SocialLinksItem({ icon, href, value, isEditing, setValue }: { icon: React.ReactNode, href: string, value: string, isEditing: boolean, setValue: (value: string) => void }) {
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      border: '1px solid #595959',
      color: 'white',
      fontSize: fontSize,
    },
    '& .MuiInputBase-input': {
      paddingY: '4.5px',
    }
  }

  return (
    <div className='text-[16px] font-semibold h-full flex items-center gap-2' style={{ color: grayColor3 }}>
      {isEditing ? (
        <div className='w-full flex items-center gap-4'>
          {icon}
          <TextField
            sx={textFieldStyle}
            fullWidth
            variant="outlined"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus={true}
          />
        </div>
      ) : (
        <IconButton
          component="a"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          sx={{ color: grayColor3, display: 'flex', gap: 1 }}>
          {icon}
          <span className='text-[16px] font-semibold'>{value || 'Anonymous'}</span>
        </IconButton>
      )}
    </div>
  )
}