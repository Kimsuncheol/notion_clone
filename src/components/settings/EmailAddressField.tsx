import { grayColor3, mintColor1 } from '@/constants/color';
import { fontSize } from '@/constants/size'
import { CustomUserProfile } from '@/types/firebase';
import { TextField } from '@mui/material';
import React, { useState } from 'react'

interface EmailAddressFieldProps {
  userProfile: CustomUserProfile | null;
}

export default function EmailAddressField({ userProfile }: EmailAddressFieldProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [email, setEmail] = useState<string>(userProfile?.email || '');
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      border: '1px solid #595959',
      color: 'white',
      fontSize: fontSize,
    },
    '& .MuiInputBase-input': {
      paddingY: '4.5px',
      paddingX: '12px',
    }
  }

  return (
    <div className='flex flex-col gap-4 w-full pb-4 border-b-[1px] border-gray-200'>
      <div className='flex w-full items-center gap-4'>
        <div className='font-semibold w-1/5' style={{ fontSize: fontSize }}>Email address</div>
        <div className='w-4/5 flex items-center gap-4'>
          {isEditing ? (
            <div className='w-full flex items-center gap-4'>
              <TextField
                variant="outlined"
                sx={textFieldStyle}
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus={true}
              />
            </div>
          ) : (
            <div className='w-full text-[16px] leading-[34px] font-semibold h-full'
              style={{ color: grayColor3 }}>
              {userProfile?.email || 'Anonymous'}
            </div>
          )}
          <div className='text-[16px] font-semibold cursor-pointer text-right' style={{ color: mintColor1 }} onClick={() => {
            setIsEditing(!isEditing);
          }}>{isEditing ? 'Save' : 'Edit'}</div>
        </div>
      </div>
      <div className='' style={{ color: grayColor3, fontSize: fontSize }}>This is email address that you use to login to your account</div>
    </div>
  )
}
