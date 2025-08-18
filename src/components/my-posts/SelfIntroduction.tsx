import { modalBgColor2, settingsPageMintColor } from '@/constants/color';
import { firebaseApp } from '@/constants/firebase';
import { Avatar, Button, TextField } from '@mui/material'
import { getAuth } from 'firebase/auth';
import React, { useEffect, useState } from 'react'

export default function SelfIntroduction() {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  const avatarSize = 140;
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [selfIntroduction, setSelfIntroduction] = useState<string>('');

  useEffect(() => {
    if (isEdit) {
      setSelfIntroduction(user?.displayName || '');
    }
  }, [isEdit, user]);

  return (
    <div className='flex flex-col gap-10 py-10'>
      {/* Avatar and Name */}
      <div className='w-full flex items-center gap-10 border-b border-gray-300 pb-10'>
        <Avatar src={user?.photoURL || ''} alt={user?.displayName || ''} sx={{ width: avatarSize, height: avatarSize }} />
        <div className='flex flex-col'>
          <div className='text-2xl font-bold'>{user?.displayName || 'User'}</div>
          <div className='text-lg text-gray-500'>{user?.email || ''}</div>
        </div>
      </div>
      {/* Followers and Following */}
      <div className='w-full flex items-center gap-10 border-b border-gray-300 pb-10'>
        <div className='flex gap-4 items-center'>
          <div className='text-lg font-bold flex flex-col items-center'>
            <div className='text-2xl font-bold'>100</div>
            <div className='text-sm text-gray-500'>Followers</div>
          </div>
          <div className='text-lg font-bold flex flex-col items-center'>
            <div className='text-2xl font-bold'>100</div>
            <div className='text-sm text-gray-500'>Following</div>
          </div>
          <div className='text-lg font-bold flex flex-col items-center'>
            <div className='text-2xl font-bold'>100</div>
            <div className='text-sm text-gray-500'>Posts</div>
          </div>
        </div>
      </div>
      {/* Self Introduction */}
      <div className='w-full flex flex-col gap-4'>
        <div className='text-2xl font-bold'>Self Introduction</div>
        <div className='text-lg text-gray-500 flex gap-4 items-center'>
          {isEdit ? (
          <TextField
            value={selfIntroduction}
            onChange={(e) => setSelfIntroduction(e.target.value)}
            multiline
            rows={4}
            sx={{ width: '100%', backgroundColor: modalBgColor2, color: 'white' }}
          />
          ) : (
            <p className='text-lg text-gray-500 w-full'>{selfIntroduction}</p>
          )}
          <Button variant='contained' disableElevation sx={{ width: 100, height: 40, backgroundColor: settingsPageMintColor, color: 'black', fontWeight: 'bold', fontSize: '16px' }} onClick={() => setIsEdit(!isEdit)}>{isEdit ? 'Save' : 'Edit'}</Button>
        </div>
      </div>
    </div>
  )
}
